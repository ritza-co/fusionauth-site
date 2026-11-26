# FusionAuth Modern Guide to OAuth example application

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-modern-guide-to-oauth). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This project is an application that we build as part of our [Modern Guide to OAuth eBook](https://fusionauth.io/articles/oauth/modern-guide-to-oauth).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

## Project Dependencies

* Docker, for running FusionAuth
* Node. Tested with version 20, but should work with any modern version.

## Running FusionAuth
To run FusionAuth, just stand up the docker containers using `docker compose`.

```shell
docker compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App
To run the application, first install the modules

```shell
npm install
```
Then start the server.

```shell
npm run start
```

Visit the local webserver at `http://localhost:3000/` and sign in using the credentials:

* username: richard@example.com
* password: password

You can also visit the FusionAuth admin at `http://localhost:9011` and sign in using the credentials:

* username: admin@example.com
* password: password

