> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/theme-history-updater). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


This repo updates the [fusionauth-theme-history](https://github.com/FusionAuth/fusionauth-theme-history) repo, allowing FusionAuth users to see changes in themes over time. It exists only for that purpose.

Learn more about [FusionAuth themes](https://fusionauth.io/docs/customize/look-and-feel/).

The reason not to put all these scripts in that fusionauth-theme-history repo is to keep that git history clean.

This is a combination of shell scripts and GH workflow.

It depends on there being a GH PAT available to commit the fusionauth-theme-history repo from a workflow starting here.

## More Details

We first check the versions of FusionAuth (as defined by account) and versions of themes (as defined by tags). If these match, we're done.

If they don't, we stand up a version of FusionAuth inside the GitHub action, pull down the default advanced theme (using `fusionauth-theme-helper`), and then add it to the repo. It uses the `ks/ks.json` file to initialize the FusionAuth instance, and tests to see that the API key works.

`bin` contains all the scripts, but they can't be used entirely outside of GitHub actions because GH actions does some of the fiddling with the repositories (cloning, etc).

## Future Improvements

We don't handle backports of fixes currently.

Would be nice for the scripts to work transparently whether in or out of GH actions.

