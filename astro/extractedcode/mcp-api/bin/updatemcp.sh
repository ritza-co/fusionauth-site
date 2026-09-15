#!/bin/bash

npm install

# bumps version in the package.json
npm version patch --no-git-tag-version

npm run build:openapi-mcp-generator
npm run build:mcp-api
npm run generate

## todo, commit version
