# Plugin Example Docker Compose Configurations

This example builds an Example Password Hasher Plugin with a maven init-container and adds it in to a mounted directory. Which then, when built successfully, gets directly mounted as a directory in to your FusionAuth Docker container.

## Plugin

The `maven` init-container executes the different commands to compile package and then copy the Example Password Hasher Plugin JAR file and sets the right permissions after that. Because the maven container isn't aware about FusionAuth we have to use the UID and GID in the chown step.

It is working as an init-container because it goes through a set of steps and exits successfully and the `fusionauth` container waits for the `maven` container to finish with the state `condition: service_completed_successfully`.

For further details on Example Password Hasher check https://github.com/FusionAuth/fusionauth-example-password-encryptor and for writing Plugins https://fusionauth.io/docs/extend/code/password-hashes/writing-a-plugin. 