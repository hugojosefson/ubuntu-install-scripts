# vi:syntax=bash

# .bash_aliases
alias ba='vim ~/.bash_aliases'
alias .ba='. ~/.bash_aliases'

# node
alias nn='nodeversion=$(cat package.json | jq -r .engines.node); nvm install $nodeversion'

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
complete -F _tmuxinator m

# Make
alias mp='make package'

# Git
. /usr/share/bash-completion/completions/git
alias gk='gitk --all &>/dev/null &'

__git_complete g __git_main
function g() {
    local cmd=${1-status}
    shift
    git $cmd "$@"
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

__git_complete gd _git_diff
function gd() {
    git diff "$@"
}

__git_complete ga _git_add
function ga() {
    git add --all "$@"
}

__git_complete gp _git_push
function gp() {
    git push "$@"
}

__git_complete gpl _git_pull
function gpl() {
    git pull "$@"
}


# Docker
function d() {
    local cmd=${1-ps}
    shift
    docker $cmd "$@"
}


# npm
which npm > /dev/null && . <(npm completion)

# pbcopy / pbpaste
alias pbcopy='xsel --clipboard --input'
alias pbpaste='xsel --clipboard --output'

# temp directory
alias t='cd $(mktemp -d)'
