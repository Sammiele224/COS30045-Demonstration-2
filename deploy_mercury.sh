#!/bin/sh
set -eu

if [ "$#" -ne 1 ]; then
  printf 'Usage: %s s<studentID>\n' "$0" >&2
  exit 2
fi

mercury_user=$1
case "$mercury_user" in
  s[0-9]* ) ;;
  * ) printf 'Mercury username should start with s followed by your student ID.\n' >&2; exit 2 ;;
esac

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir"
python3 prepare_submissions.py

printf '\nConnect to the Swinburne VPN first.\n'
printf 'Sign in to Mercury with your university password, note the URL shown, then type exit.\n\n'
ssh "$mercury_user@mercury.swin.edu.au"

printf '\nUploading the four-page website to Mercury...\n'
rsync -av mercury_site/ "$mercury_user@mercury.swin.edu.au:~/cos30045/www/htdocs/"

base_url="https://mercury.swin.edu.au/cos30045/$mercury_user"
printf '\nCheck these four pages in a browser:\n'
printf '%s\n' "$base_url/week4/house.html" \
  "$base_url/week4/bar.html" \
  "$base_url/week5/index.html" \
  "$base_url/week6/index.html"
