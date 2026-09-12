-- Run after Lazy sync in a fresh Neovim process, with the user's configuration.
local function install()
  assert(vim.v.errmsg == "", vim.v.errmsg)
  local lazy = require("lazy")
  local plugins = require("lazy.core.config").plugins
  assert(plugins.LazyVim, "The configuration did not load LazyVim")
  -- Prevent LazyVim's background parser installer from racing the explicit
  -- installation below. This modifies only this process, never user files.
  local parsers = {}
  if plugins["nvim-treesitter"] then
    local opts = LazyVim.opts("nvim-treesitter")
    parsers = vim.deepcopy(opts.ensure_installed or {})
    opts.ensure_installed = {}
  end
  if vim.env.UBUNTU_INSTALL_LAZYVIM_PHASE == "sync" then
    lazy.sync({ wait = true, show = false })
    plugins = require("lazy.core.config").plugins
  end
  for name, plugin in pairs(plugins) do
    assert(plugin._.installed, "Plugin is not installed: " .. name)
    for _, task in ipairs(plugin._.tasks or {}) do
      assert(not task:has_errors(), "Plugin task failed: " .. name)
    end
  end
  if vim.env.UBUNTU_INSTALL_LAZYVIM_PHASE == "sync" then
    return
  end

  local load = {}
  for _, name in ipairs({ "mason.nvim", "mason-lspconfig.nvim", "nvim-lspconfig", "nvim-treesitter" }) do
    if plugins[name] then
      table.insert(load, name)
    end
  end
  lazy.load({ plugins = load })

  -- Completion's native library is normally fetched on the first InsertEnter.
  if plugins["blink.cmp"] then
    lazy.load({ plugins = { "blink.cmp" } })
    local implementation = require("blink.cmp.config").fuzzy.implementation
    if implementation ~= "lua" then
      assert(
        vim.wait(300000, function()
          return require("blink.cmp.fuzzy").implementation_type == "rust"
        end, 100),
        "Blink completion's native library was not installed"
      )
    end
  end

  if plugins["mason.nvim"] then
    local registry = require("mason-registry")
    local refreshed, refresh_ok = false, false
    registry.refresh(function(ok)
      refreshed, refresh_ok = true, ok
    end)
    assert(
      vim.wait(300000, function()
        return refreshed
      end, 100),
      "Mason registry refresh timed out"
    )
    assert(refresh_ok, "Mason registry refresh failed")
    local tools = {}
    for _, name in ipairs(LazyVim.opts("mason.nvim").ensure_installed or {}) do
      tools[name] = true
    end
    if plugins["mason-lspconfig.nvim"] then
      local mapping = require("mason-lspconfig.mappings").get_mason_map().lspconfig_to_package
      for name, opts in pairs(LazyVim.opts("nvim-lspconfig").servers or {}) do
        if
          opts ~= false
          and not (type(opts) == "table" and (opts.enabled == false or opts.mason == false))
          and mapping[name]
        then
          tools[mapping[name]] = true
        end
      end
      for _, name in ipairs(LazyVim.opts("mason-lspconfig.nvim").ensure_installed or {}) do
        assert(mapping[name], "Unknown Mason LSP server: " .. name)
        tools[mapping[name]] = true
      end
    end
    local pending, failed = 0, {}
    for name in pairs(tools) do
      local package = registry.get_package(name)
      if package:is_installing() then
        assert(
          vim.wait(600000, function()
            return not package:is_installing()
          end, 100),
          "Mason install timed out: " .. name
        )
        assert(package:is_installed(), "Mason install failed: " .. name)
      end
      -- Updating an installed package also builds any native components now.
      pending = pending + 1
      package:install({}, function(success)
        if not success then
          table.insert(failed, name)
        end
        pending = pending - 1
      end)
    end
    assert(
      vim.wait(600000, function()
        return pending == 0
      end, 100),
      "Mason installs timed out"
    )
    assert(#failed == 0, "Mason installs failed: " .. table.concat(failed, ", "))
    for name in pairs(tools) do
      assert(registry.get_package(name):is_installed(), "Missing Mason tool: " .. name)
    end
  end

  if plugins["nvim-treesitter"] then
    local ts = require("nvim-treesitter")
    for _, name in ipairs(ts.get_installed("parsers")) do
      if not vim.tbl_contains(parsers, name) then
        table.insert(parsers, name)
      end
    end
    -- Current nvim-treesitter returns an async task; wait includes compilation.
    assert(ts.install(parsers, { force = true, max_jobs = 4 }):wait(600000), "Treesitter installation failed")
    local installed = ts.get_installed("parsers")
    for _, name in ipairs(parsers) do
      assert(vim.tbl_contains(installed, name), "Missing Treesitter parser: " .. name)
      assert(pcall(vim.treesitter.language.add, name), "Cannot load Treesitter parser: " .. name)
    end
  end
  assert(vim.v.errmsg == "", vim.v.errmsg)
  print("LazyVim plugins, configured Mason tools, and Treesitter parsers are installed.")
end

local ok, err = xpcall(install, debug.traceback)
if not ok then
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
else
  vim.cmd("qa!")
end
