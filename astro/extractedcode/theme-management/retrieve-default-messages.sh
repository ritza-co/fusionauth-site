#!/bin/sh

API_KEY=$1
THEME_ID=$2

curl -s -H "Authorization: $API_KEY" 'http://localhost:9011/api/theme/'$THEME_ID|jq '.theme.defaultMessages' |sed 's/^"//' |sed 's/"$//' |python3 convert-newlines.py > defaultmessages.txt

