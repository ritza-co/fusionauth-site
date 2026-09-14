# Repository Import Mapping

This file tracks which repositories need to be imported into `astro/extractedcode/`.

## Status Legend
- **NEW** - Needs to be imported
- **EXISTS** - Already in astro/extractedcode/
- **SKIP** - Not importing (internal repo, not owned by us, etc.)

## Repositories to Import

| Source Repository | Target Folder | Status | Referenced By (NOT DONE files) |
|---|---|---|---|
| FusionAuth/fusionauth-containers | containers | NEW | docker.mdx, kubernetes/index.mdx |
| FusionAuth/fusionauth-contrib | contrib | NEW | key-master.mdx |
| FusionAuth/fusionauth-example-5-minute-guide | example-5-minute-guide | NEW | 5-minute-*.mdx |
| FusionAuth/fusionauth-example-anonymous-user | example-anonymous-user | NEW | anonymous-user.mdx |
| FusionAuth/fusionauth-example-api-consents-platform | example-api-consents-platform | NEW | api-consents-platform.mdx |
| FusionAuth/fusionauth-example-cdk-cognito-migration | example-cdk-cognito-migration | NEW | cognito.mdx |
| FusionAuth/fusionauth-example-device-limit-friendly | example-device-limit-friendly | NEW | device-limiting.mdx |
| FusionAuth/fusionauth-example-device-limit-simple | example-device-limit-simple | NEW | device-limiting.mdx |
| FusionAuth/fusionauth-example-docker-compose | example-docker-compose | NEW | docker.mdx |
| FusionAuth/fusionauth-example-fine-grained-authorization | example-fine-grained-authorization | NEW | fine-grained-authorization.mdx |
| FusionAuth/fusionauth-example-get-started | example-get-started | NEW | step-*.mdx |
| FusionAuth/fusionauth-example-javascript-webauthn | example-javascript-webauthn | NEW | webauthn-passkeys.mdx |
| FusionAuth/fusionauth-example-javascript-webhooks | example-javascript-webhooks | NEW | writing-a-webhook.mdx, webhook-event-log.mdx |
| FusionAuth/fusionauth-example-machine-to-machine | example-machine-to-machine | NEW | machine-to-machine.mdx |
| FusionAuth/fusionauth-example-modeling-organizations | example-modeling-organizations | NEW | modeling-organizations.mdx |
| FusionAuth/fusionauth-example-multiapp-dashboard | example-multiapp-dashboard | NEW | multi-application-dashboard.mdx |
| FusionAuth/fusionauth-example-node-centralized-sessions | example-node-centralized-sessions | NEW | controlling-access-mcp-server.mdx |
| FusionAuth/fusionauth-example-node-sso | example-node-sso | NEW | single-sign-on.mdx |
| FusionAuth/fusionauth-example-password-encryptor | example-password-encryptor | NEW | custom-password-hashing.mdx, writing-a-plugin.mdx |
| FusionAuth/fusionauth-example-protected-mcp-server | example-protected-mcp-server | NEW | controlling-access-mcp-server.mdx |
| FusionAuth/fusionauth-example-ropc-azure-function | example-ropc-azure-function | NEW | azureadb2c.mdx |
| FusionAuth/fusionauth-example-salesforce-oidc | example-salesforce-oidc | NEW | salesforce.mdx |
| FusionAuth/fusionauth-example-scim-integration | example-scim-integration | NEW | scim-sdk.mdx |
| FusionAuth/fusionauth-example-terraform | example-terraform | NEW | terraform.mdx |
| FusionAuth/fusionauth-example-user-actions-guide | example-user-actions-guide | NEW | user-actions.mdx |
| FusionAuth/fusionauth-import-scripts | import-scripts | NEW | import.mdx, passportjs.mdx, rails.mdx |
| FusionAuth/fusionauth-plugin-api | plugin-api | NEW | writing-a-plugin.mdx |

## Already Imported (in astro/extractedcode/)

- example-testing-lambdas
- quickstart-django-web
- quickstart-dotnet-api
- quickstart-express
- quickstart-golang-api
- quickstart-golang-web
- quickstart-php-laravel-web
- quickstart-php-web
- quickstart-rails-api
- quickstart-react
- quickstart-remix
- quickstart-rust-actix
- quickstart-springboot-api
- quickstart-wordpress-web
- webauthn

## Skipped

- FusionAuth/fusionauth-site - Internal repo, don't import into itself
- elastic/Helm-charts - Not owned by FusionAuth

## Import Process

For each NEW repository:
1. git clone https://github.com/<source-repo> astro/extractedcode/<target-folder>
2. rm -rf astro/extractedcode/<target-folder>/.git
3. Add/update README.md with warning (using extractedcode path)
4. Add repositoryUrl.txt with format: github.com/<source-repo>.git
5. Create tests/test.sh that prints "todo"

## Progress Tracking

- [ ] Clone all repositories
- [ ] Remove .git folders
- [ ] Add README warnings
- [ ] Add repositoryUrl.txt files
- [ ] Add tests/test.sh files
- [ ] Update task.md with completion notes
