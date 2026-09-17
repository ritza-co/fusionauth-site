# FusionAuth FGA by Permify — Bulk Permissions Check Example

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-permify-bulk-check). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

Example code for the blog post [How to Perform a Bulk Permissions Check in FusionAuth FGA by Permify](https://fusionauth.io/blog/permify-bulk-permissions-check).

## Prerequisites

- [Docker](https://docs.docker.com/engine/install)
- `curl`
- `jq`

## Running the example

**1. Start Permify**

```sh
docker run --rm --name="permify" -p 3476:3476 -p 3478:3478 ghcr.io/permify/permify serve
```

**2. Write the schema and data**

In a second terminal:

```sh
sh setup.sh
```

**3. Run the bulk permissions check**

```sh
sh bulk-check.sh
```

**4. (Optional) Run the lookup-entity example**

```sh
sh lookup-entity.sh
```
