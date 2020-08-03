# vi:syntax=bash

# .bash_aliases
alias ba='vim ~/.bash_aliases'
alias .ba='. ~/.bash_aliases'

# ls
alias ls='exa -F'
alias l='exa -F'
alias ll='exa -lF'
alias la='exa -aF'
alias lla='exa -Fla'

# node
alias nn='nvm install $(cat package.json | jq -r .engines.node)'

# tmuxinator
alias mux=tmuxinator
alias m=mux
alias mm='mux mux'
_tmuxinator() {
    COMPREPLY=()
    local word
    word="${COMP_WORDS[COMP_CWORD]}"

    if [ "$COMP_CWORD" -eq 1 ]; then
        local commands="$(compgen -W "$(tmuxinator commands)" -- "$word")"
        local projects="$(compgen -W "$(tmuxinator completions start)" -- "$word")"

        COMPREPLY=( $commands $projects )
    elif [ "$COMP_CWORD" -eq 2 ]; then
        local words
        words=("${COMP_WORDS[@]}")
        unset words[0]
        unset words[$COMP_CWORD]
        local completions
        completions=$(tmuxinator completions "${words[@]}")
        COMPREPLY=( $(compgen -W "$completions" -- "$word") )
    fi
}
complete -F _tmuxinator tmuxinator mux m

# Git
[[ -f /usr/share/bash-completion/completions/git ]] && . /usr/share/bash-completion/completions/git
[[ -f /usr/local/etc/bash_completion.d/git-completion.bash ]] && . /usr/local/etc/bash_completion.d/git-completion.bash
alias gk='gitk --all &>/dev/null &'
command -v gh > /dev/null && . <(gh completion)

__git_complete g __git_main
function g() {
    local cmd=${1-status}
    shift
    git ${cmd} "$@"
}

__git_complete gf _git_fetch
function gf() {
    git fetch --all --prune "$@"
}

__git_complete gc _git_commit
function gc() {
    git commit "$@"
}
function gg() {
    git commit -m "$*"
}
function gam() {
    git commit --amend -m "$*"
}

__git_complete gd _git_diff
function gd() {
    git diff "$@"
}

__git_complete ga _git_add
function ga() {
    git add "$@:---all"
}

__git_complete gp _git_push
function gp() {
    git push "$@"
}

__git_complete gpl _git_pull
function gpl() {
    git pull --rebase "$@"
}


# Docker
function d() {
    local cmd=${1-ps}
    shift
    docker ${cmd} "$@"
}


# npm completion, takes about 1/4 second extra when starting every shell
# which npm >/dev/null 2>&1 && . <(npm completion)
# . ~/bin/npm-completion

# pbcopy / pbpaste
alias pbcopy='xsel --clipboard --input'
alias pbpaste='xsel --clipboard --output'
#alias pbcopy='wl-copy'
#alias pbpaste='wl-paste'

# directory
function mkcd () {
  mkdir -p -- "$1" && cd -- "$1"
}

# temp directory
alias t='cd $(mktemp -d)'
