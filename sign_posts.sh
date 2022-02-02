#!/bin/bash
# Signs all posts

for file in _posts/*.md
do
  if [ -f "$file.asc" ]; then
    echo "$file is already signed"
  else
    echo "signing $file"
    gpg --detach-sign -a "$file"
  fi
done
