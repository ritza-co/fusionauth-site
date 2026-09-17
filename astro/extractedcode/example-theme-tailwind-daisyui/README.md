# FusionAuth + Tailwind + DaisyUI

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-theme-tailwind-daisyui). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains an example of how to integrate [Tailwind CSS](https://tailwindcss.com), and [DaisyUI](https://daisyui.com/) into your [FusionAuth](https://fusionauth.io) theme.

## Prerequisites

* Node.js
* Yarn or NPM
* A FusionAuth instance. This can be locally installed or in the cloud. See [FusionAuth](https://fusionauth.io) for more information.
* (optional) FreeMarker plugin for VSCode: https://marketplace.visualstudio.com/items?itemName=dcortes92.FreeMarker

## Setting up Environment

1. Create an API key in FusionAuth. This key will be used to communicate with the FusionAuth API. See [API Keys](https://fusionauth.io/docs/v1/tech/apis/authentication#api-keys) for more information.
    1. Navigate to **Settings** > **API Keys**.
    2. Click **Add**.
    3. Enter a description for the key.
    4. Select `GET` and `PATCH` options for `/api/theme`
    5. Note the API key value. This will be used in step 3.
    6. Click **Save**.
2. Duplicate the default FusionAuth theme
    1. Navigate to **Settings** > **Themes**.
    2. Click **Duplicate**.
    3. Enter a name for the theme.
    4. Click **Save**.
    5. Note the ID of the theme. This will be used in step 3.

## Download the theme

1. Run `npx fusionauth theme:download <themeId> --k <apiKey>` to export the theme.
2. The theme will be downloaded to the `tpl` directory.

Please note that the export will overwrite the `tpl` directory, and any changes you have made to the files will be lost.

## Build the tailwind css

1. Run `tailwindcss -i ./input.css -o ./tpl/stylesheet.css` to build the tailwind css.
2. The css will be built to the `tpl/stylesheet.css` file.

If you want to minify the css, run `tailwindcss -i ./input.css -o ./tpl/stylesheet.css --minify`.

## Upload the theme

1. Run `npx fusionauth theme:upload <themeId> --k <apiKey>` to export the theme.
2. The theme will be uploaded from the `tpl` directory.

Please note that the import will overwrite the theme in FusionAuth, and any changes you have made to the theme through the FusionAuth UI will be lost.

## Custom styles

1. Add custom styles to the `input.css` file.

## Automatically build and upload the theme

Run `npm run watch:theme` and `npm run watch:tailwind` in two separate terminals to automatically build and upload the theme when changes are made.
