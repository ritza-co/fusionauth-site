#!/bin/sh

API_KEY=$1
THEME_ID=$2

FILE_NAME=out.json$$

awk '{printf "%s", $0"\\n"}' defaultmessages.txt |sed 's/^/{ "theme": { "defaultMessages": "/' | sed 's/$/"}}/' > $FILE_NAME

STATUS_CODE=`curl -XPATCH -H 'Content-type: application/json' -H "Authorization: $API_KEY" 'http://localhost:9011/api/theme/'$THEME_ID -d @$FILE_NAME -o /dev/null -w '%{http_code}' -s`

if [ $STATUS_CODE -ne 200 ]; then
  echo "Error with patch, exited with status code: "$STATUS_CODE
  exit 1
fi

rm $FILE_NAME
