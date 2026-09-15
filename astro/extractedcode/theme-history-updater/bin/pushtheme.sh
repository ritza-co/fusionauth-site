#!/bin/bash

# get theme from command line
if [ "x$1" != "x" ]; then
  latest_released_version=$1
fi

if [ "x$latest_released_version" == "x" ]; then
  echo "no released version var found"
  exit 1
fi

echo $latest_released_version

# copy to history
cd fusionauth-theme-helper

cp tmp/*.ftl ../fusionauth-theme-history/themes
cp tmp/*.txt ../fusionauth-theme-history/themes

# check it in
cd ../fusionauth-theme-history

git status

git add .
git commit -m "$latest_released_version themes" .
git tag $latest_released_version
git tag

# push that up happens in GH workflow so easier to handle GH tokens

