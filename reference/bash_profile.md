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


## Git

alias master='git checkout master'
alias pull='git pull'
alias push='git push origin HEAD'
alias gitclean='git branch | grep -v "^*"" | xargs git branch -d'

parse_git_branch() {
    git_status="$(git status 2> /dev/null)"
    pattern="On branch ([^[:space:]]*)"
    if [[ ! ${git_status} =~ "(working (tree|directory) clean)" ]]; then
        state="*"
    fi
    if [[ ${git_status} =~ ${pattern} ]]; then
      branch=${match[1]}
      branch_cut=${branch:0:35}
      if (( ${#branch} > ${#branch_cut} )); then
          echo "(${branch_cut}…${state})"
      else
          echo "(${branch}${state})"
      fi
    fi
}

# Ruby

alias brake='bundle exec rake'
alias brails='bundle exec rails'

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"


# signing scripts
export PATH="$HOME/bin:$PATH"
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
