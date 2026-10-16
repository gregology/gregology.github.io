#!/bin/bash
# Clear-signs all posts and every page with `signed: true` in its front matter.
# A file is (re)signed when it has no .asc yet or its content has changed since it was signed.

cd "$(dirname "$0")" || exit 1

# Clear-signing drops trailing whitespace, so strip it before comparing
normalize() {
  sed 's/[[:space:]]*$//'
}

has_signed_front_matter() {
  awk 'NR == 1 && $0 != "---" { exit }
       NR > 1 && $0 == "---" { exit }
       tolower($0) ~ /^signed:[[:space:]]*true[[:space:]]*$/ { found = 1; exit }
       END { exit !found }' "$1"
}

is_up_to_date() {
  [ -f "$1.asc" ] &&
    [ "$(gpg --batch --decrypt "$1.asc" 2>/dev/null | normalize)" == "$(normalize < "$1")" ]
}

files=(_posts/*.md)
while IFS= read -r file; do
  [ -f "$file" ] && has_signed_front_matter "$file" && files+=("$file")
done < <(git ls-files --cached --others --exclude-standard -- '*.md' ':(exclude)_posts/')

signed=0
failed=0
for file in "${files[@]}"; do
  if is_up_to_date "$file"; then
    continue
  elif [ -f "$file.asc" ]; then
    echo "re-signing $file (changed since last signed)"
  else
    echo "signing $file"
  fi

  if gpg --yes --clear-sign "$file"; then
    signed=$((signed + 1))
  else
    echo "failed to sign $file" >&2
    failed=$((failed + 1))
  fi
done

echo "$signed signed, $failed failed, $((${#files[@]} - signed - failed)) already up to date"
[ "$failed" -eq 0 ]
