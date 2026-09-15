#!/bin/bash

# we just try to generate the new version. if there are any changes other than the 'generated on' message, we have a new openapi file and need to bump the version and then check it in

npm install

npm run build:openapi-mcp-generator
npm run build:mcp-api
npm run generate

GENERATED_FILE=packages/mcp-api/src/index.ts

if [ ! -f "$GENERATED_FILE" ]; then
    echo "Error: $GENERATED_FILE does not exist"
    exit 1
fi

lines_changed=`git diff -U0 $GENERATED_FILE | grep '^[+-]' | grep -v '^[+-][+-][+-]' |grep -v 'Generated on' |wc -l|sed 's/\s+//g'`

echo "lines_changed"
echo $lines_changed

# if none chanted, exit
if [[ "$lines_changed" == "0" ]]; then
  echo "no new openapi lines"
  echo "keepgoing=false" >> "$GITHUB_OUTPUT"
  exit 0
else
  echo "keepgoing=true" >> "$GITHUB_OUTPUT"
fi

