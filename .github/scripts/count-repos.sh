#!/bin/sh

# count the repos we have in our example apps page and the number we have in our organization and make sure they match

#fusionauth-containers, fusionauth-theme-helper, etc
EXTRA_IN_JSON_NOT_NAMED_CORRECTLY=4 

# fusionauth-example-template and (temporarily) fusionauth-example-vue-sdk
EXTRA_IN_GH_NOT_DISPLAYABLE=3

cat astro/src/content/json/exampleapps.json|jq '.[]|.url' |sed 's/"//g'|sed 's!https://github.com/!!i' > json.list
COUNT_IN_JSON=`wc -l json.list |sed 's/^ *//' |sed 's/ .*//'`

gh repo list fusionauth --no-archived --visibility public -L 300 |grep fusionauth-example | sed 's/\t.*//g'> ex.list
COUNT_EXAMPLE_REPOS=`wc -l ex.list |sed 's/^ *//' |sed 's/ .*//'`

gh repo list fusionauth --no-archived --visibility public -L 300 |grep fusionauth-quickstart | sed 's/\t.*//g'> qs.list
COUNT_QUICKSTART_REPOS=`wc -l qs.list |sed 's/^ *//' |sed 's/ .*//'`

sort json.list > json.sorted
sort ex.list qs.list > gh.sorted
diff json.sorted gh.sorted

echo "$COUNT_QUICKSTART_REPOS + $COUNT_EXAMPLE_REPOS - $EXTRA_IN_GH_NOT_DISPLAYABLE - $COUNT_IN_JSON + $EXTRA_IN_JSON_NOT_NAMED_CORRECTLY"|bc
