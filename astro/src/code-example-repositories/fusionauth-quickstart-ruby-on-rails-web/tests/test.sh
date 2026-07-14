#!/usr/bin/env bash
set -euo pipefail

echo "TODO: write more comprehensive tests using old github workflow below and command below"

# cd complete-app && docker run   --network host --name ruby --platform  linux/amd64  -p 3000:3000 -v gems:/usr/local/bundle -v .:/app -w /app -it --rm ruby:4.0.5 bash -c "bundle install && OP_SECRET_KEY=super-secret-secret-that-should-be-regenerated-for-production bundle exec rails s -b 0.0.0.0"

#---
# name:
#   test_install

# # Controls when the action will run.
# on:
#   # Triggers the workflow on push or pull request events but only for the master branch
#   push:
#     branches: [ main ]
#   # run once a month
#   schedule:
#     - cron: '31 17 5 * *'

#   # Allows you to run this workflow manually from the Actions tab
#   workflow_dispatch:

# # Cancel stale executions is easy
# concurrency:
#   group: ${{ github.workflow }}-${{ github.ref }}
#   cancel-in-progress: true

# # A workflow run is made up of one or more jobs that can run sequentially or in parallel
# jobs:
#   # This workflow contains a single job called "install"
#   test_install:
#     # The type of runner that the job will run on
#     runs-on: ubuntu-latest

#     # timeout after a certain period
#     timeout-minutes: 5

#     # Steps represent a sequence of tasks that will be executed as part of the job
#     steps:
#       # Setup the system with the repository code and Ruby
#       - uses: actions/checkout@v3
#       - uses: ruby/setup-ruby@v1
#         with:
#           bundler-cache: true # runs 'bundle install' and caches installed gems automatically
#           ruby-version: '3.2.2'
#           working-directory: complete-app
