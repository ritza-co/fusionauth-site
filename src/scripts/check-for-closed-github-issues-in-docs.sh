#!/bin/bash
VERBOSE=""
if [ "$1" == "-v" ]; then
  VERBOSE="true"
fi
rm -f numbers
# find all the issue numbers in the docs
for i in `grep -ilR https://github.com/fusionauth/fusionauth-issues/issue astro/src/content/docs|grep -v 'release-notes'`; do
  grep -i github.com/FusionAuth/fusionauth-issues/issues/ $i|grep -v new/choose |sed 's!.*https://!!'|sed 's!).*!!' |sed 's!".*!!'|sed 's! .*!!'|sed 's!.*-issues/issues/!!' |sed 's![^0-9]*!!g'  >> numbers
done
# Repository in the format owner/repo
repo="fusionauth/fusionauth-issues"
CLOSED_COUNT=0
# Loop through the issue numbers and check if they are closed
for issue in `sort -un numbers`; do
  # Check if issue has an open milestone
  milestone_number=$(gh issue view "$issue" --repo "$repo" --json milestone --jq '.milestone.number // empty')
  if [ -z $milestone_number ]; then 
    milestone_state="na"
  else 
    milestone_state=$(gh api repos/fusionauth/fusionauth-issues/milestones/$milestone_number | jq -r '.state')
  fi

  # Skip issues that are associated with an open milestone
  if [ "$milestone_state" == "open" ]; then
    if [ "$VERBOSE" == "true" ]; then
      echo "Issue #$issue has an OPEN milestone - skipping"
    fi
    continue
  fi

  status=$(gh issue view "$issue" --repo "$repo" --json state --jq '.state')
  
  if [ "$status" == "CLOSED" ]; then
    if [ "$VERBOSE" == "true" ]; then
      echo "Issue #$issue is CLOSED"
    fi
    CLOSED_COUNT=$((CLOSED_COUNT + 1)) # Increment the closed issue count
  fi
done
echo -n $CLOSED_COUNT
