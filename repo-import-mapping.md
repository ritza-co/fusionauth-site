# Repository Import Mapping

## Instructions for Future Sessions

This file tracks which repositories need to be imported into `astro/extractedcode/`.

### Status Categories
- **IMPORTED**: Repos already in astro/extractedcode/ in the current branch
- **NEEDS_REVIEW**: Repos imported but need human review before being marked as fully IMPORTED
- **IMPORTED_IN_BRANCH**: Repos imported in other branches, not yet merged to main
- **NEEDS_IMPORT**: Repos referenced in docs but not yet imported
- **NOT_REFERENCED**: Repos not referenced in any documentation (should not be imported)

### Key Rules
1. **Sort by status**: Always keep repos sorted by status (IMPORTED → IMPORTED_IN_BRANCH → NEEDS_IMPORT)
2. **NOT_REFERENCED repos**: Keep as a simple list at the bottom, no table format, no details
3. **Find repos by repositoryUrl.txt**: Search for `repositoryUrl.txt` files across all branches, not just folder names
4. **Check all branches**: Some repos exist at old paths like `astro/src/code-example-repositories/` in older branches
5. **Folder names matter**: Use the actual folder name from the repo, not the repo name (e.g., `quickstart-django-web` not `quickstart-python-django-web`)
6. **Never split NOT_REFERENCED**: Keep them in one simple list, don't categorize or split them
7. **Branch status section**: Maintain a separate section listing which branches contain IMPORTED_IN_BRANCH repos

### How to Find Repos in Branches
```bash
# Search for repositoryUrl.txt files across all branches
for branch in $(git branch -a --format='%(refname:short)'); do
  git ls-tree -r "$branch" --name-only 2>/dev/null | grep "repositoryUrl.txt$" | grep -E "(extractedcode|localcode|code-example-repositories)"
done
```

### Current Branch
We are currently on branch: `draft_bluehawkAllRepos`

---

## IMPORTED Repos (42)

| Source Repository | Target Folder | Status | Referenced By |
|---|---|---|---|
| FusionAuth/fusionauth-quickstart-express | quickstart-express | IMPORTED | (internal - no external repo) |
| FusionAuth/fusionauth-webauthn | webauthn | IMPORTED | (internal - no external repo) |
| FusionAuth/fusionauth-containers | containers | IMPORTED | get-started/download-and-install/docker.mdx, kubernetes/index.mdx |
| FusionAuth/fusionauth-contrib | contrib | IMPORTED | operate/secure/key-master.mdx |
| FusionAuth/fusionauth-example-5-minute-guide | example-5-minute-guide | IMPORTED | 5-minute-intro/_5-minute-configure-node-application.mdx, _5-minute-logout.mdx, _5-minute-store-user-object.mdx |
| FusionAuth/fusionauth-example-anonymous-user | example-anonymous-user | IMPORTED | lifecycle/register-users/anonymous-user.mdx |
| FusionAuth/fusionauth-example-api-consents-platform | example-api-consents-platform | IMPORTED | get-started/use-cases/api-consents-platform.mdx |
| FusionAuth/fusionauth-example-cdk-cognito-migration | example-cdk-cognito-migration | IMPORTED | lifecycle/migrate-users/provider-specific/cognito.mdx |
| FusionAuth/fusionauth-example-device-limit-friendly | example-device-limit-friendly | IMPORTED | extend/examples/device-limiting.mdx |
| FusionAuth/fusionauth-example-device-limit-simple | example-device-limit-simple | IMPORTED | extend/examples/device-limiting.mdx |
| FusionAuth/fusionauth-example-docker-compose | example-docker-compose | IMPORTED | extend/events-and-webhooks/kafka/index.mdx, docker-configuration.mdx |
| FusionAuth/fusionauth-example-fine-grained-authorization | example-fine-grained-authorization | IMPORTED | extend/fine-grained-authorization.mdx |
| FusionAuth/fusionauth-example-get-started | example-get-started | IMPORTED | get-started/start-here/step-5.mdx, step-6.mdx |
| FusionAuth/fusionauth-example-javascript-webauthn | example-javascript-webauthn | IMPORTED | lifecycle/authenticate-users/passwordless/webauthn-passkeys.mdx |
| FusionAuth/fusionauth-example-javascript-webhooks | example-javascript-webhooks | IMPORTED | extend/events-and-webhooks/signing.mdx, writing-a-webhook.mdx |
| FusionAuth/fusionauth-example-machine-to-machine | example-machine-to-machine | IMPORTED | get-started/use-cases/machine-to-machine.mdx |
| FusionAuth/fusionauth-example-modeling-organizations | example-modeling-organizations | IMPORTED | extend/examples/modeling-organizations.mdx |
| FusionAuth/fusionauth-example-multiapp-dashboard | example-multiapp-dashboard | IMPORTED | extend/examples/multi-application-dashboard.mdx |
| FusionAuth/fusionauth-example-node-centralized-sessions | example-node-centralized-sessions | IMPORTED | lifecycle/authenticate-users/logout-session-management.mdx |
| FusionAuth/fusionauth-example-node-sso | example-node-sso | IMPORTED | lifecycle/authenticate-users/single-sign-on.mdx |
| FusionAuth/fusionauth-example-password-encryptor | example-password-encryptor | IMPORTED | extend/code/password-hashes/custom-password-hashing.mdx, writing-a-plugin.mdx |
| FusionAuth/fusionauth-example-protected-mcp-server | example-protected-mcp-server | IMPORTED | extend/examples/controlling-access-mcp-server.mdx |
| FusionAuth/fusionauth-example-ropc-azure-function | example-ropc-azure-function | IMPORTED | lifecycle/migrate-users/provider-specific/azureadb2c.mdx |
| FusionAuth/fusionauth-example-salesforce-oidc | example-salesforce-oidc | IMPORTED | lifecycle/authenticate-users/integrations/oidc/salesforce.mdx |
| FusionAuth/fusionauth-example-scim-integration | example-scim-integration | IMPORTED | lifecycle/migrate-users/scim/scim-sdk.mdx |
| FusionAuth/fusionauth-example-terraform | example-terraform | IMPORTED | operate/deploy/terraform.mdx |
| FusionAuth/fusionauth-example-testing-lambdas | example-testing-lambdas | IMPORTED | extend/code/lambdas/testing.mdx |
| FusionAuth/fusionauth-example-user-actions-guide | example-user-actions-guide | IMPORTED | lifecycle/manage-users/user-actions.mdx |
| FusionAuth/fusionauth-import-scripts | import-scripts | IMPORTED | lifecycle/migrate-users/provider-specific/forgerock.mdx, keycloak.mdx, pingone.mdx, stytch.mdx, supabase.mdx, wordpress.mdx |
| FusionAuth/fusionauth-plugin-api | plugin-api | IMPORTED | extend/code/password-hashes/writing-a-plugin.mdx |
| FusionAuth/fusionauth-quickstart-python-django-web | quickstart-django-web | IMPORTED | get-started/quickstarts/web/quickstart-python-django-web.mdx |
| FusionAuth/fusionauth-quickstart-dotnet-api | quickstart-dotnet-api | IMPORTED | get-started/quickstarts/api/quickstart-dotnet-api.mdx |
| FusionAuth/fusionauth-quickstart-golang-api | quickstart-golang-api | IMPORTED | get-started/quickstarts/api/quickstart-golang-api.mdx |
| FusionAuth/fusionauth-quickstart-golang-web | quickstart-golang-web | IMPORTED | get-started/quickstarts/web/quickstart-golang-web.mdx |
| FusionAuth/fusionauth-quickstart-php-laravel-web | quickstart-php-laravel-web | IMPORTED | get-started/quickstarts/web/quickstart-php-laravel-web.mdx |
| FusionAuth/fusionauth-quickstart-php-web | quickstart-php-web | IMPORTED | get-started/quickstarts/web/quickstart-php-web.mdx |
| FusionAuth/fusionauth-quickstart-ruby-on-rails-api | quickstart-rails-api | IMPORTED | get-started/quickstarts/api/quickstart-ruby-on-rails-api.mdx |
| FusionAuth/fusionauth-quickstart-react | quickstart-react | IMPORTED | (not found in docs) |
| FusionAuth/fusionauth-quickstart-javascript-remix-web | quickstart-remix | IMPORTED | get-started/quickstarts/web/quickstart-javascript-remix-web.mdx |
| FusionAuth/fusionauth-quickstart-rust-actix-web | quickstart-rust-actix | IMPORTED | get-started/quickstarts/web/quickstart-rust-actix-web.mdx |
| FusionAuth/fusionauth-quickstart-java-springboot-api | quickstart-springboot-api | IMPORTED | get-started/quickstarts/api/quickstart-java-springboot-api.mdx |
| FusionAuth/fusionauth-quickstart-wordpress-web | quickstart-wordpress-web | IMPORTED | get-started/quickstarts/web/quickstart-wordpress-web.mdx |

## NEEDS_REVIEW Repos (48)

| Source Repository | Target Folder | Status | Referenced By |
|---|---|---|---|
| FusionAuth/fusionauth-android-sdk | android-sdk | NEEDS_REVIEW | sdks/android-sdk.mdx |
| FusionAuth/fusionauth-example-azure-ad-bulk-export | example-azure-ad-bulk-export | NEEDS_REVIEW | lifecycle/migrate-users/provider-specific/azureadb2c.mdx |
| FusionAuth/fusionauth-example-client-libraries | example-client-libraries | NEEDS_REVIEW | sdks/netcore.mdx |
| FusionAuth/fusionauth-example-device-grant | example-device-grant | NEEDS_REVIEW | lifecycle/authenticate-users/oauth/index.mdx |
| FusionAuth/fusionauth-example-flask-portal | example-flask-portal | NEEDS_REVIEW | lifecycle/register-users/advanced-registration-forms.mdx |
| FusionAuth/fusionauth-example-full-user-search | example-full-user-search | NEEDS_REVIEW | _shared/_user-search-limits-workarounds.mdx |
| FusionAuth/fusionauth-example-github-actions | example-github-actions | NEEDS_REVIEW | cloud/operate/test.mdx |
| FusionAuth/fusionauth-example-kickstart | example-kickstart | NEEDS_REVIEW | customize/look-and-feel/advanced-themes/kickstart-custom-theme.mdx |
| FusionAuth/fusionauth-example-migrating-rails | example-migrating-rails | NEEDS_REVIEW | lifecycle/migrate-users/framework-specific/rails.mdx |
| FusionAuth/fusionauth-example-node-multi-tenant | example-node-multi-tenant | NEEDS_REVIEW | extend/examples/multi-tenant.mdx |
| FusionAuth/fusionauth-example-symfony-multitenant | example-symfony-multitenant | NEEDS_REVIEW | extend/examples/multi-tenant.mdx |
| FusionAuth/fusionauth-example-theme-tailwind-daisyui | example-theme-tailwind-daisyui | NEEDS_REVIEW | customize/look-and-feel/advanced-themes/tailwind.mdx |
| FusionAuth/fusionauth-go-client | go-client | NEEDS_REVIEW | sdks/go.mdx |
| FusionAuth/homebrew-fusionauth | homebrew-fusionauth | NEEDS_REVIEW | get-started/download-and-install/fusionauth-app.mdx |
| FusionAuth/fusionauth-install | install | NEEDS_REVIEW | get-started/download-and-install/upgrade.mdx |
| FusionAuth/fusionauth-issues | issues | NEEDS_REVIEW | apis/index.mdx, customize/look-and-feel/advanced-themes/index.mdx |
| FusionAuth/fusionauth-java-client | java-client | NEEDS_REVIEW | sdks/java.mdx |
| FusionAuth/fusionauth-javascript-sdk | javascript-sdk | NEEDS_REVIEW | sdks/vue-sdk.mdx |
| FusionAuth/fusionauth-jwt | jwt | NEEDS_REVIEW | apis/jwt/validate-a-jwt.mdx |
| FusionAuth/fusionauth-load-tests | load-tests | NEEDS_REVIEW | cloud/operate/load-test.mdx, operate/deploy/cluster.mdx |
| FusionAuth/fusionauth-localization | localization | NEEDS_REVIEW | customize/look-and-feel/simple-theme-editor.mdx, advanced-themes/upgrade-advanced-theme.mdx |
| FusionAuth/fusionauth-mcp-api | mcp-api | NEEDS_REVIEW | get-started/download-and-install/development/mcp-server.mdx |
| FusionAuth/fusionauth-netcore-client | netcore-client | NEEDS_REVIEW | sdks/netcore.mdx |
| FusionAuth/fusionauth-node-cli | node-cli | NEEDS_REVIEW | customize/cli.mdx, extend/code/lambdas/testing.mdx |
| FusionAuth/fusionauth-openapi | openapi | NEEDS_REVIEW | sdks/openapi.mdx |
| FusionAuth/fusionauth-php-client | php-client | NEEDS_REVIEW | sdks/php.mdx |
| FusionAuth/fusionauth-python-client | python-client | NEEDS_REVIEW | sdks/python.mdx |
| FusionAuth/fusionauth-quickstart-app | quickstart-app | NEEDS_REVIEW | get-started/quickstarts/web/express.mdx |
| FusionAuth/fusionauth-quickstart-flutter-native | quickstart-flutter-native | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-flutter-native.mdx |
| FusionAuth/fusionauth-quickstart-java-android-native | quickstart-java-android-native | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-java-android-native.mdx |
| FusionAuth/fusionauth-quickstart-java-springboot-web | quickstart-java-springboot-web | NEEDS_REVIEW | get-started/quickstarts/web/quickstart-java-springboot-web.mdx |
| FusionAuth/fusionauth-quickstart-javascript-nuxt-web | quickstart-javascript-nuxt-web | NEEDS_REVIEW | get-started/quickstarts/web/quickstart-javascript-nuxt-web.mdx |
| FusionAuth/fusionauth-quickstart-kotlin-android-native | quickstart-kotlin-android-native | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-kotlin-android-native.mdx |
| FusionAuth/fusionauth-quickstart-python-flask-web | quickstart-python-flask-web | NEEDS_REVIEW | get-started/quickstarts/web/quickstart-python-flask-web.mdx |
| FusionAuth/fusionauth-quickstart-react-native | quickstart-react-native | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-react-native.mdx |
| FusionAuth/fusionauth-quickstart-swift-ios-native | quickstart-swift-ios-native | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-swift-ios-native.mdx |
| FusionAuth/fusionauth-quickstart-swift-ios-native-appauth | quickstart-swift-ios-native-appauth | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-swift-ios-native-appauth.mdx |
| FusionAuth/fusionauth-render-blueprint | render-blueprint | NEEDS_REVIEW | get-started/marketplaces/render.mdx |
| FusionAuth/fusionauth-ruby-client | ruby-client | NEEDS_REVIEW | sdks/ruby.mdx |
| FusionAuth/fusionauth-swift-sdk | swift-sdk | NEEDS_REVIEW | sdks/swift-sdk.mdx |
| FusionAuth/terraform-provider-fusionauth | terraform-provider | NEEDS_REVIEW | operate/deploy/terraform.mdx |
| FusionAuth/fusionauth-theme-helper | theme-helper | NEEDS_REVIEW | customize/look-and-feel/advanced-themes/upgrade-advanced-theme.mdx |
| FusionAuth/fusionauth-theme-history | theme-history | NEEDS_REVIEW | customize/look-and-feel/advanced-themes/upgrade-advanced-theme.mdx |
| FusionAuth/fusionauth-theme-history-updater | theme-history-updater | NEEDS_REVIEW | get-started/marketplaces/github-actions.mdx |
| FusionAuth/fusionauth-theme-management | theme-management | NEEDS_REVIEW | lifecycle/register-users/advanced-registration-forms.mdx |
| FusionAuth/fusionauth-typescript-client | typescript-client | NEEDS_REVIEW | extend/code/lambdas/testing.mdx |
| FusionAuth/openid-AppAuth-Android | openid-appauth-android | NEEDS_REVIEW | get-started/quickstarts/app/quickstart-java-android-native.mdx |
| FusionAuth/rack-jwt | rack-jwt | NEEDS_REVIEW | get-started/quickstarts/api/quickstart-ruby-on-rails-api.mdx |


## IMPORTED_IN_BRANCH Repos (10)

| Source Repository | Target Folder | Status | Referenced By |
|---|---|---|---|
| FusionAuth/fusionauth-example-scripts | example-scripts | IMPORTED_IN_BRANCH | apis/users/import.mdx, customize/look-and-feel/client-side-password-rule-validation.mdx, lifecycle/authenticate-users/integrations/saml/aiven.mdx, operate/secure/key-rotation.mdx |
| FusionAuth/fusionauth-example-user-search | example-user-search | IMPORTED_IN_BRANCH | lifecycle/manage-users/search/user-search-with-elasticsearch.mdx |
| FusionAuth/fusionauth-quickstart-dotnet-web | quickstart-dotnet-web | IMPORTED_IN_BRANCH | get-started/quickstarts/web/quickstart-dotnet-web.mdx |
| FusionAuth/fusionauth-quickstart-javascript-angular-web | quickstart-javascript-angular-web | IMPORTED_IN_BRANCH | get-started/quickstarts/spa/quickstart-javascript-angular-web.mdx |
| FusionAuth/fusionauth-quickstart-javascript-express-api | quickstart-javascript-express-api | IMPORTED_IN_BRANCH | get-started/quickstarts/api/quickstart-javascript-express-api.mdx |
| FusionAuth/fusionauth-quickstart-javascript-nextjs-web | quickstart-javascript-nextjs-web | IMPORTED_IN_BRANCH | get-started/quickstarts/web/quickstart-javascript-nextjs-web.mdx |
| FusionAuth/fusionauth-quickstart-javascript-vue-web | quickstart-javascript-vue-web | IMPORTED_IN_BRANCH | get-started/quickstarts/spa/quickstart-javascript-vue-web.mdx |
| FusionAuth/fusionauth-quickstart-php-drupal-web | quickstart-php-drupal-web | IMPORTED_IN_BRANCH | get-started/quickstarts/web/quickstart-php-drupal-web.mdx |
| FusionAuth/fusionauth-quickstart-php-laravel-api | quickstart-php-laravel-api | IMPORTED_IN_BRANCH | get-started/quickstarts/api/quickstart-php-laravel-api.mdx |
| FusionAuth/fusionauth-quickstart-ruby-on-rails-web | quickstart-ruby-on-rails-web | IMPORTED_IN_BRANCH | get-started/quickstarts/web/quickstart-ruby-on-rails-web.mdx |

## NOT_REFERENCED Repos (58)

These repos exist on GitHub but are not referenced in any documentation. They should NOT be imported:

- charts
- fusionauth-brainf-sdk
- fusionauth-dart-client
- fusionauth-example-angular
- fusionauth-example-asp-netcore
- fusionauth-example-asp-netcore5
- fusionauth-example-cohort-analysis
- fusionauth-example-cross-platform-game
- fusionauth-example-django-single-sign-on
- fusionauth-example-dotnet-windowsform-api
- fusionauth-example-express-api
- fusionauth-example-express-consents
- fusionauth-example-express-twitter
- fusionauth-example-family-api
- fusionauth-example-flutter-dart
- fusionauth-example-gaming-device-grant
- fusionauth-example-go-device-code-grant
- fusionauth-example-go-jwt-microservices
- fusionauth-example-hostedbackend
- fusionauth-example-java
- fusionauth-example-lambda-webhook
- fusionauth-example-laravel
- fusionauth-example-laravel-single-sign-on
- fusionauth-example-modern-guide-to-oauth
- fusionauth-example-netcore
- fusionauth-example-netcore6
- fusionauth-example-nextjs-magic-links
- fusionauth-example-nextjs-single-sign-on
- fusionauth-example-node
- fusionauth-example-node-deeplink
- fusionauth-example-node-services-gateway
- fusionauth-example-node-services-gateway-jwtauth
- fusionauth-example-php-connector
- fusionauth-example-php-webhook
- fusionauth-example-python-hotspot
- fusionauth-example-rails-api
- fusionauth-example-rails-oauth
- fusionauth-example-react
- fusionauth-example-react-2.0
- fusionauth-example-react-fusiondesk
- fusionauth-example-react-guide
- fusionauth-example-remix
- fusionauth-example-ruby-jwt
- fusionauth-example-ruby-on-rails-custom-scopes
- fusionauth-example-ruby-tenant-creation
- fusionauth-example-spring-security
- fusionauth-example-using-links-fastify
- fusionauth-example-vercel-vue-deploy
- fusionauth-example-wordpress-sso
- fusionauth-javascript-sdk-express
- fusionauth-node-client
- fusionauth-react-sdk
- fusionauth-samlv2
- java-http
- nodebb-plugin-fusionauth-oidc
- react-sdk-dpop-example
- security-scripts
- wordpress-openid-connect

## Branch Import Status

- **example-scripts** - imported in `bluehawkCodeExamples` and `origin/fix/example-scripts-extractedcode` branches
- **example-user-search** - imported in `bluehawkCodeExamples` and `origin/fix/example-scripts-extractedcode` branches
- **quickstart-dotnet-web** - imported in `draft_DotNetWebBluehawkMigration` branch
- **quickstart-javascript-angular-web** - imported in `draft_bluehawkAngular` branch
- **quickstart-javascript-express-api** - imported in `draft_DotNetWebBluehawkMigration`, `draft_drupalBluehawk`, and `quickstartMigrationToBluehawk` branches
- **quickstart-javascript-nextjs-web** - imported in `draft_DotNetWebBluehawkMigration`, `draft_drupalBluehawk`, and `quickstartMigrationToBluehawk` branches
- **quickstart-javascript-vue-web** - imported in `draft_DotNetWebBluehawkMigration`, `draft_drupalBluehawk`, and `quickstartMigrationToBluehawk` branches
- **quickstart-php-drupal-web** - imported in `origin/draft_drupalBluehawk` branch
- **quickstart-php-laravel-api** - imported in `bluehawk_quickstartLaravelApi` and `origin/fix/laravel-api-jwt-hardening` branches
- **quickstart-ruby-on-rails-web** - imported in `draft_DotNetWebBluehawkMigration`, `draft_drupalBluehawk`, and `quickstartMigrationToBluehawk` branches

## Summary

- **IMPORTED**: 42 repos already in astro/extractedcode/
- **NEEDS_REVIEW**: 48 repos imported but need human review
- **IMPORTED_IN_BRANCH**: 10 repos imported in other branches, not yet merged to main
- **NEEDS_IMPORT**: 0 repos referenced in docs but not yet imported
- **NOT_REFERENCED**: 58 repos not referenced in any documentation (should not be imported)

## Import Process

- Never ever commit to git or do a git branch or checkout!!!  Don't run npm commands or other destructive commands or docker !

For each NEEDS_IMPORT repository:

1. Clone the repository:
   ```bash
   git clone https://github.com/<source-repo> astro/extractedcode/<target-folder>
   ```

2. Remove the .git folder:
   ```bash
   rm -rf astro/extractedcode/<target-folder>/.git
   ```

3. Add repositoryUrl.txt:
   ```bash
   echo "github.com/<source-repo>.git" > astro/extractedcode/<target-folder>/repositoryUrl.txt
   ```

4. Create tests/test.sh:
   ```bash
   mkdir -p astro/extractedcode/<target-folder>/tests
   cat > astro/extractedcode/<target-folder>/tests/test.sh << 'EOF'
   #!/usr/bin/env bash
   set -euo pipefail
   echo "todo"
   EOF
   chmod +x astro/extractedcode/<target-folder>/tests/test.sh
   ```

5. Update README.md with warning:
   ```markdown
   > [!WARNING]
   > This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/<target-folder>). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.
   ```

6. Check for .gitignore issues:
   - If repo has `.env` or env.sample files, add `!astro/extractedcode/<target-folder>/**/.env*` to root .gitignore
   - If repo has `build/` folder, add `!astro/extractedcode/<target-folder>/**/build` to root .gitignore
   - Never modify root .gitignore, or files outside the extractedcode folder.

7. Update this mapping file:
   - Move repo from NEEDS_IMPORT to IMPORTED
   - Update summary counts
