---
title: .zshrc and .bash_profile
disqus: yep
layout: page
---

Useful aliases and alike from my `.zshrc`

```
export EDITOR="nano"
export HISTSIZE=1000000
export HISTFILESIZE=1000000


# PATH

# Homebrew
export PATH=/opt/homebrew/bin:$PATH
# npm global packages
export PATH="$HOME/.npm-global/bin:$PATH"
# Signing scripts
export PATH="~/src/bin/sign:$PATH"


# Git
alias giti='code .git/info/exclude'
alias gitig='code ~/.gitignore'

autoload -Uz compinit && compinit

alias main='git checkout main || git checkout master'
alias master='main'
alias pull='git pull'
alias push='git push origin HEAD'
alias fush='git push origin HEAD -f'
alias amend='git commit --amend --no-edit'

parse_git_branch() {
    git_status="$(git status 2> /dev/null)"
    pattern="On branch ([^[:space:]]*)"
    if [[ ! ${git_status} =~ "(working (tree|directory) clean)" ]]; then
        state="*"
    fi
    if [[ ${git_status} =~ ${pattern} ]]; then
      branch=${match[1]}
      branch_cut=${branch:0:60}
      if (( ${#branch} > ${#branch_cut} )); then
          echo "(${branch_cut}…${state})"
      else
          echo "(${branch}${state})"
      fi
    fi
}

setopt PROMPT_SUBST
PROMPT='%{%F{blue}%}%9c%{%F{none}%}$(parse_git_branch)$ '
RPROMPT='%*'


## Mac shortcuts
alias zshrc='code --new-window --add ~/common.code-workspace ~/.zshrc'
alias profile='code --new-window --add ~/common.code-workspace  ~/.zshrc'
alias sp='source ~/.zshrc'
alias hist='code --new-window --add ~/common.code-workspace  ~/.zsh_history'


## App shortcuts
alias vlc='/Applications/VLC.app/Contents/MacOS/VLC'


# Ruby
alias brake='bundle exec rake'
alias brails='bundle exec rails'

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"


# Python
eval "$(pyenv init --path)"
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"


# Functions

stopwatch() {
    start_time=$(date +%s)
    "$@"
    end_time=$(date +%s)
    execution_time=$((end_time-start_time))
    echo "Execution time: $execution_time seconds"
}

generate_alias() {
  cd_alias_name="cd${1}"
  code_alias_name="co${1}"
  pull_alias_name="p${1}"
  dir_path="$2"

  alias "$cd_alias_name"="cd $dir_path"
  alias "$code_alias_name"="code $dir_path"
  alias "$pull_alias_name"="(cd $dir_path && git pull)"
}

# Example usage:
generate_alias g ~/src/gregology.github.io
generate_alias e ~/src/esphome

```

My old `.bash_profile` from before MacOS moved from bash to zsh by default.

```
export EDITOR="nano"

export HISTSIZE=1000000
export HISTFILESIZE=1000000

## Git

alias master='git checkout master'
alias pull='git pull'
alias push='git push origin HEAD'
alias gitclean='git branch | grep -v "^*"" | xargs git branch -d'

parse_git_branch() {
  git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

export PS1="\u@\h \W\[\033[32m\]\$(parse_git_branch)\[\033[00m\] $ "

# Rails

alias brake='bundle exec rake'
alias brails='bundle exec rails'
alias hrake='heroku run rake'
alias hrails='heroku run rails'

# Dev

dcd() {
  dev cd "$1"
  code .
}

fortune | cowsay
```
