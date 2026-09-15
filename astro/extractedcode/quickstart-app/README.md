> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-app). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


# Fusionauth QuickStart App

This repository contains a Docker configuration for a FusionAuth instance, its dependencies, and the initial configuration you need to run a QuickStart.

## Prerequisites

* [Docker](https://docs.docker.com/get-started/get-docker/) 23 or later
* On macOS and Windows, one of the following container management tools:
  * [Docker desktop](https://www.docker.com/products/docker-desktop/)
  * [OrbStack](https://docs.orbstack.dev/quick-start) (to use Orbstack for `docker compose` commands after install, run `docker context use orbstack`)
  * [Podman](https://podman.io/docs/installation) (in the commands below, replace `docker` with `podman`)

## Install and Run FusionAuth

1. Open your container management tool (listed in the prerequisites above).

1. Clone this repo to your local machine:

   ```console
   git clone git@github.com:FusionAuth/fusionauth-quickstart-app.git
   ```

1. Navigate into the cloned directory:

   ```console
   cd fusionauth-quickstart-app
   ```

1. To start a local instance of FusionAuth, run the following command (omit the `-d` flag to see all Docker logs):

   ```console
   docker compose up -d
   ```

1. Wait until all networks, volumes, and containers have a green status of **Healthy**, **Started**, or **Created** (this may take a few minutes, depending on your network speed and cached dependencies).

1. Open [http://localhost:9011](http://localhost:9011) to access the FusionAuth Admin UI.

1. Click the lock icon in the top right of the screen to log in with these credentials:

   * username: `admin@example.com`
   * password: `password`
