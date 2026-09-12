-- Exercise normal file and completion events after provisioning, without a network.
local function check()
  local plugins = require("lazy.core.config").plugins
  for name, plugin in pairs(plugins) do
    assert(plugin._.installed, "Missing plugin: " .. name)
  end
  vim.api.nvim_exec_autocmds("User", { pattern = "VeryLazy" })
  require("lazy").load({ plugins = { "nvim-lspconfig", "mason.nvim", "nvim-treesitter", "blink.cmp" } })
  assert(
    vim.wait(10000, function()
      return require("blink.cmp.fuzzy").implementation_type == "rust"
    end, 50),
    "Completion did not start offline"
  )
  for _, name in ipairs(LazyVim.opts("nvim-treesitter").ensure_installed) do
    assert(vim.tbl_contains(require("nvim-treesitter").get_installed("parsers"), name), "Missing parser: " .. name)
    vim.treesitter.language.add(name)
  end
  local registry = require("mason-registry")
  for _, name in ipairs({ "stylua", "shfmt", "lua-language-server" }) do
    assert(registry.get_package(name):is_installed(), "Missing tool: " .. name)
  end
  vim.cmd("edit /tmp/offline-example.lua")
  vim.api.nvim_buf_set_lines(0, 0, -1, false, { "local answer = 42", "print(answer)" })
  vim.cmd("setfiletype lua")
  assert(
    vim.wait(10000, function()
      return #vim.lsp.get_clients({ name = "lua_ls" }) > 0
    end, 50),
    "Lua language server did not start offline"
  )
  -- Leave time for deferred startup and completion work to run.
  vim.wait(2000, function()
    return false
  end, 50)
  assert(vim.v.errmsg == "", vim.v.errmsg)
  print("Offline LazyVim startup, completion, parsers, and Lua LSP passed.")
end
local ok, err = xpcall(check, debug.traceback)
if not ok then
  io.stderr:write(tostring(err) .. "\n")
  vim.cmd("cquit 1")
else
  vim.cmd("qa!")
end
