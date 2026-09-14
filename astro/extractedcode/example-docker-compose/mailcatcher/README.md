# MailCatcher Example Docker Compose Configurations

This example stages a development FusionAuth environment including mailcatcher which allows FusionAuth to send transactional emails for account verification, password reset, and others in your development environment.

## MailCatcher

This example is making use of Kickstart to pre-configure mail server `"host": "mailcatcher"` and `"port": 1025` which is made available through the `docker-compose.yml` configuration.

Further details on the MailCatcher configuration you can find at https://fusionauth.io/docs/get-started/download-and-install/docker#other-services.

## Kickstart

More information around kickstart is available at https://fusionauth.io/docs/get-started/download-and-install/development/kickstart and docker compose related kickstart documentation at https://fusionauth.io/docs/get-started/download-and-install/docker#kickstart.

### email_templates

This example is using a set of [Email Templates](https://fusionauth.io/docs/customize/email-and-messages/email-templates) which can be modified before the initial deployment of the FusionAuth instance.

Follow the instructions on [Email Templates](https://fusionauth.io/docs/customize/email-and-messages/email-templates) to get the latest templates and on how to change them for your environment.