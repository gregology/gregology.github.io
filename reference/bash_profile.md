---
title: .bash_profile
disqus: yep
layout: page
---

Useful aliases and alike from my .bash_profile

```
export EDITOR="nano"

export HISTSIZE=1000000
export HISTFILESIZE=1000000

## Git

alias master='git checkout master'
alias pull='git pull'
alias push='git push origin HEAD'
alias hush='git push heroku HEAD'
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

```