> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/example-client-libraries). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.


# Client library examples

Examples of usage of FusionAuth client libraries to configure and manage FusionAuth. 

There's a readme in each of the language subdirectories.

You can [learn more about our client libraries.](https://fusionauth.io/docs/v1/tech/client-libraries/)

## Install FusionAuth Locally

If you have [Docker](https://www.docker.com/), you can install FusionAuth locally to test out these scripts.

* Clone this repository `git clone https://github.com/FusionAuth/fusionauth-example-client-libraries.git`
* Run `docker compose up -d` to stand up FusionAuth.
* Use [the API key found in the kickstart file](/kickstart/kickstart.json#L15) whenever one is needed.
* Review the README in each language directory for how to run the scripts.

> If you ever want to reset the FusionAuth system, delete the volumes created by Docker Compose by executing `docker compose down -v`, then re-run `docker compose up -d`. This is useful if you want to start over with a fresh FusionAuth instance.

To help you set up a valid application in FusionAuth, we have created a FusionAuth [Kickstart](/kickstart/kickstart.json). Note that the Kickstart is designed to be used when starting up FusionAuth for the first time using `docker compose up`.

This [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart) will set up a FusionAuth application and create a new user to login to the application. The Kickstart creates a new [FusionAuth Application](https://fusionauth.io/docs/v1/tech/core-concepts/applications) with the following settings:

- The Application is named `Example Application`.
- The Application Client Id is `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`.
- The Client Secret is `change-this-in-production-to-be-a-real-secret`.
- The Application has a redirect URL of `https://localhost:5001/callback`.
- The Application has a logout URL of `https://localhost:5001/`.

The application is set up with the following OAuth settings:

- The OAuth Authorization Grant Types are `Authorization Code` and `Refresh Token`.
- PKCE (Proof Key for Code Exchange) is required.
- JWT (JSON Web Token) is enabled, using a newly generated asymmetric key pair (RSA).

After running the Docker Compose file, you can access the FusionAuth admin site at [http://localhost:9011](http://localhost:9011). You can log in with the following credentials:

- Email: `admin@example.com`
- Password: `password`

[Learn more about Kickstart.](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart)

## TODO

Add testing.


## Upgrade Policy

This library is built automatically to keep track of the FusionAuth API, and may also receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that it uses.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and will eventually be updated to use a newer version.
