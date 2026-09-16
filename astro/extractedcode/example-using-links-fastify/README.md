
# FusionAuth + Fastify: Using Links with Google & X.com (Twitter)

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-using-links-fastify). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

An example Fastify application showing how to use FusionAuth "links" to connect user accounts with external providers like Google and X.com (Twitter). The repository also includes a Docker‑based FusionAuth instance configured with Kickstart to speed up local development.

- Example application location: `./complete-application/`
- FusionAuth via Docker Compose: `./docker-compose.yml` + `./kickstart/` + `./.env`

Follow the blog post [Multi-Platform Video Uploads: Using Identity Provider Links](https://fusionauth.io/blog/using-identity-provider-links) for a detailed explanation of how to set up and use this example.

And check out the official documentation for more information on FusionAuth and Fastify:
- FusionAuth documentation: https://fusionauth.io/docs/
- Fastify documentation: https://fastify.dev/docs/

## Prerequisites

- Docker and Docker Compose (for running FusionAuth locally)
- Node.js 22+ (Node 24+ recommended) and npm
- Internet access for installing dependencies and configuring external identity providers Google and X.com (Twitter)

## Start FusionAuth with Docker

This repository includes a ready‑to‑run FusionAuth instance using Docker Compose. From the repository root:

```bash
docker compose up -d
```

- FusionAuth Admin UI will be available at: http://localhost:9011
- Kickstart files in `./kickstart/` will auto‑configure a tenant and application on first boot.

If you need to customize credentials or ports, create/update a `.env` file in the repo root to override variables used by `docker-compose.yml`.

The Identity Providers (IdPs) like Google and X.com (Twitter) are not preconfigured. You will need to set them up in the FusionAuth Admin UI after starting the service.

## Run the Fastify example app

Install dependencies and start the app in development mode:

```bash
cd complete-application
npm install
npm run dev
```

By default the app will start on http://localhost:3000.
