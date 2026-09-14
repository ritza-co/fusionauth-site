# Build Example Docker Compose Configurations

This example builds Example Password Hasher Plugin and adds it in to a custom fusionauth-app image.

## Build

The `docker-compose.yml` defines the `./fusionauth-app` directory instead of the fusionauth docker image. Where docker compose can find the `Dockerfile` with the build instructions.

The build is a two-stage process that first uses the docker image `maven` to compile and package the Example Password Hasher Plugin which is then in a second step copied in to the `fusionauth/fusionauth-app:latest` docker image with the right permissions.

The benefit of using `maven` as a build image is to keep any overhead, whether in size or complexity, in the final `fusionauth/fusionauth-app:latest` image to an absolute minimum.

## Usage

The general usage with Running FusionAuth docker examples applies. Check https://fusionauth.io/docs/get-started/download-and-install/docker#custom-docker-images for further details on additional commands.

## Plugin

For further details on Example Password Hasher check https://github.com/FusionAuth/fusionauth-example-password-encryptor and for writing Plugins https://fusionauth.io/docs/extend/code/password-hashes/writing-a-plugin. 