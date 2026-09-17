This branch, draft_bluehawkAllRepos, converts every use of `RemoteCode`, `RemoteValue`, and `RemoteContent` to `LocalCode`, `LocalValue`, `LocalEmailCode`, or `LocalMarkdown`. Source code tags are converted to Bluehawk (`snippet` instead of `tag::`). The only exception is articles and code changed in branches not yet merged (like some quickstarts done by Ritza), which have not been touched.

## Summary of work done

- ~120 MDX files changed: docs, blog, and emails
- 95 repositories imported to `extractedcode`
- 63 source files updated to Bluehawk tags
- One source file had nested tags, which Bluehawk can't handle. They were deleted and the mdx file was updated: `astro/extractedcode/example-device-limit-simple/complete-application/src/index.ts` used by [astro/src/content/docs/extend/examples/device-limiting.mdx](http://localhost:3001/docs/extend/examples/device-limiting).
- [Emails](http://localhost:3001/docs/customize/email-and-messages/email-templates-replacement-variables) now use `LocalEmailCode` instead of `RemoteCode` or `LocalCode`. The emails are *pulled* in from FusionAuth and thus don't belong in the `extractedcode` folder, which is used to *push* repositories out.
- Bluehawk path compaction created some duplicate snippet files. Deduplicated them by making tags more specific.
- Added `repositoryUrl.txt` to all imported repositories, and deleted their `.git` folders, but left their `.github` folders.

## To do

- This branch was created from `main` on Monday the 14th of September. Changes after this date will need to be merged in carefully before this branch can be merged back to main. Imported repositories should also be checked from changes after this date before the final merge, and their teams alerted.
- All notes are kept in the folder `zbluehawk` in the root. This folder should be deleted after the final merge. Before that, it's useful to help guide review and LLM requests.
- The snippet generation now takes 5 minutes because there are so many repos. We should investigate reducing this time. You can't use one `npx` call only though, due to how Bluehawk squashes snippet paths — unless maybe you append each tag with a unique id.
- Snippets will not generate until Nathan accepts the pull request to remove symlinks, https://github.com/nathan-contino/astro-better-code-blocks/pull/1 (or you make the change manually locally yourself when building the project and don't update npm again to overwrite it)
- **QA**. The conversions were done with an LLM, with all code changes reviewed by Richard (me). Then I manually compared a few pages from live to local, checked the rendering of dozens of pages locally only, and got the LLM to write a script to find large html differences between all pages that used a `Remote` component between live and local. There were a few systemic errors that were fixed, mostly with paths. If Nathan is happy with the general idea of this branch, a more in depth human review and Claude review should be done.
- The `Remote` components have not been deleted yet. Once merged to main and finalized, they can be.
- All tests are placeholders. They need to be added later where necessary, like for the quickstarts.
- The `quickstart-express` guide uses two repositories, one of which has no `repositoryUrl.txt`. This is a bit confusing. The repos should be merged or have a note explaining what's happening here.
- Many repositories don't belong in the docs repo because they are their own projects and not just examples, like the SDKs and client libraries, and need to use branches, which the docs repository does not support. Some repos also have their own github workflows, which need to be addressed and altered or removed before merging this branch into main. See the full list below in this article to review.

## Repos that might not be referenced

The following repositories are referenced in guides as URLs, but are not in snippet components, and may be deletable from `extractedcode` after careful checking. However, you might want to keep the `example`s because then we can write unit tests for them:

- example-azure-ad-bulk-export
- example-client-libraries
- example-device-grant
- example-flask-portal
- example-full-user-search
- example-migrating-rails
- example-node-multi-tenant
- example-symfony-multitenant
- example-theme-tailwind-daisyui
- go-client
- homebrew-fusionauth
- issues
- java-client
- load-tests
- localization
- netcore-client
- node-cli
- openapi
- openid-appauth-android
- php-client
- python-client
- quickstart-app
- rack-jwt
- render-blueprint
- ruby-client
- terraform-provider
- theme-helper
- theme-history
- theme-history-updater
- theme-management
- typescript-client

## Repos that possibly should not belong in docs

Review each URL to see if the `LocalCode` reference can be hardcoded instead so the repository can be removed from `extractedcode`.

### android-sdk (FusionAuth/fusionauth-android-sdk) - SDK
- http://localhost:3001/blog/android-end-to-end-testing
- http://localhost:3001/blog/android-sdk-beta
- http://localhost:3001/docs/sdks/android-sdk

### example-client-libraries (FusionAuth/fusionauth-example-client-libraries) - Client lib examples
- http://localhost:3001/blog/dotnet-templates
- http://localhost:3001/docs/sdks/netcore

### example-github-actions (FusionAuth/fusionauth-example-github-actions) - CI example
- http://localhost:3001/docs/cloud/operate/test

### go-client (FusionAuth/go-client) - Client library
- http://localhost:3001/blog/building-cli-app-with-device-grant-and-golang
- http://localhost:3001/docs/sdks/go

### homebrew-fusionauth (FusionAuth/homebrew-fusionauth) - Homebrew tap
- http://localhost:3001/blog/building-fusionauth-homebrew-formula
- http://localhost:3001/docs/get-started/download-and-install/fusionauth-app

### issues (FusionAuth/fusionauth-issues) - Issue tracker
- http://localhost:3001/articles/authentication/fedcm
- http://localhost:3001/blog/announcing-fusionauth-1-27
- http://localhost:3001/blog/announcing-fusionauth-1-35
- http://localhost:3001/blog/announcing-fusionauth-1-36
- http://localhost:3001/blog/announcing-fusionauth-1-38
- http://localhost:3001/blog/announcing-fusionauth-1-45
- http://localhost:3001/blog/announcing-fusionauth-1-63
- http://localhost:3001/blog/auth-architecture-part2-tmb
- http://localhost:3001/blog/backend-for-frontend
- http://localhost:3001/blog/building-fusionauth-homebrew-formula
- http://localhost:3001/blog/cimd-vs-dcr
- http://localhost:3001/blog/clearspend-customizes-fusionauth
- http://localhost:3001/blog/cybanetix-fusionauth-pci-dss
- http://localhost:3001/blog/dolphinvc-fusionauth
- http://localhost:3001/blog/fitt-finder-fusionauth
- http://localhost:3001/blog/fusionauth-2024-year-in-review
- http://localhost:3001/blog/fusionauth-family-model-consent-management
- http://localhost:3001/blog/fusionauth-idpro-membership-benefits
- http://localhost:3001/blog/fusionauth-lets-iot-firm-focus-their-app
- http://localhost:3001/blog/fusionauth-passwordless
- http://localhost:3001/blog/fusionauth-self-service-registration-typescript
- http://localhost:3001/blog/fusionauth-update-saml
- http://localhost:3001/blog/getting-started-with-email-templates
- http://localhost:3001/blog/hundreds-millions-entities
- http://localhost:3001/blog/identity-verification-before-registration
- http://localhost:3001/blog/identiverse-conference-report
- http://localhost:3001/blog/implementing-fusionauth-python
- http://localhost:3001/blog/inteligov-fusionauth-sso
- http://localhost:3001/blog/introducing-fusionauth-reactor-breached-password-detection
- http://localhost:3001/blog/jerry-hopper-gdpr-arm-manuals
- http://localhost:3001/blog/oggeh-fusionauth-gluu
- http://localhost:3001/blog/open-office-hours-19-12-17
- http://localhost:3001/blog/seegno-thousands-tenants
- http://localhost:3001/blog/softozor-fusionauth-hasura-kubernetes
- http://localhost:3001/blog/tangany-fusionauth-self-hosted-regulatory
- http://localhost:3001/blog/top-forum-posts-may-2021
- http://localhost:3001/blog/treefort-uses-fusionauth-for-all-auth
- http://localhost:3001/blog/using-fusionauth-with-cockroachdb
- http://localhost:3001/blog/what-is-fedcm
- http://localhost:3001/docs/_shared/_data-field-data-type-changes
- http://localhost:3001/docs/_shared/_scim-limits
- http://localhost:3001/docs/_shared/_token-storage-options
- http://localhost:3001/docs/apis
- http://localhost:3001/docs/cloud/reference/limits
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes
- http://localhost:3001/docs/customize/look-and-feel/application-specific-themes
- http://localhost:3001/docs/extend/events-and-webhooks/writing-a-webhook
- http://localhost:3001/docs/extend/examples/controlling-access-mcp-server
- http://localhost:3001/docs/extend/examples/device-limiting
- http://localhost:3001/docs/get-started/core-concepts/_configuration-limits
- http://localhost:3001/docs/get-started/core-concepts/_downtime-upgrade-limitation
- http://localhost:3001/docs/get-started/core-concepts/_multi-tenant-limitations
- http://localhost:3001/docs/get-started/core-concepts/integration-points
- http://localhost:3001/docs/get-started/core-concepts/types/entity-management
- http://localhost:3001/docs/get-started/download-and-install/development/kickstart
- http://localhost:3001/docs/get-started/download-and-install/reference/system-requirements
- http://localhost:3001/docs/get-started/marketplaces
- http://localhost:3001/docs/get-started/use-cases/authorization-hub
- http://localhost:3001/docs/get-started/use-cases/machine-to-machine
- http://localhost:3001/docs/lifecycle/authenticate-users/identity-providers
- http://localhost:3001/docs/lifecycle/authenticate-users/integrations/saml/aiven
- http://localhost:3001/docs/lifecycle/authenticate-users/logout-session-management
- http://localhost:3001/docs/lifecycle/authenticate-users/passwordless/magic-links
- http://localhost:3001/docs/lifecycle/manage-users/account-management/_account-logout
- http://localhost:3001/docs/lifecycle/manage-users/verification/_common-questions-gating
- http://localhost:3001/docs/lifecycle/migrate-users
- http://localhost:3001/docs/lifecycle/migrate-users/_performance-tips
- http://localhost:3001/docs/lifecycle/migrate-users/connectors
- http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/_what-next-azure-ad-b2c
- http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/duende
- http://localhost:3001/docs/operate/deploy
- http://localhost:3001/docs/operate/deploy/proxy-setup
- http://localhost:3001/docs/operate/deploy/upgrade
- http://localhost:3001/docs/operate/deploy/user-support-guide
- http://localhost:3001/docs/operate/monitor
- http://localhost:3001/docs/operate/monitor/opentelemetry
- http://localhost:3001/docs/operate/monitor/prometheus
- http://localhost:3001/docs/operate/secure/key-rotation
- http://localhost:3001/docs/operate/troubleshooting
- http://localhost:3001/docs/reference/cookies
- http://localhost:3001/docs/sdks
- http://localhost:3001/docs/sdks/_how-to-use-client-libraries
- http://localhost:3001/docs/sdks/_static-patch-note
- http://localhost:3001/releases/v1-14-0
- http://localhost:3001/releases/v1-19-0
- http://localhost:3001/releases/v1-30-0
- http://localhost:3001/releases/v1-45-0
- http://localhost:3001/releases/v1-60-1

### java-client (FusionAuth/fusionauth-java-client) - Client library
- http://localhost:3001/blog/using-java-to-manage-fusionauth
- http://localhost:3001/docs/operate/deploy/_client-library-versioning
- http://localhost:3001/docs/sdks/java

### javascript-sdk (FusionAuth/fusionauth-javascript-sdk) - SDK
- http://localhost:3001/docs/get-started/quickstarts/spa/react
- http://localhost:3001/docs/sdks/angular-sdk
- http://localhost:3001/docs/sdks/react-sdk
- http://localhost:3001/docs/sdks/vue-sdk

### jwt (FusionAuth/fusionauth-jwt) - JWT library
- http://localhost:3001/blog/top-forum-posts-apr-2021
- http://localhost:3001/docs/apis/_shared/_refresh-token-response-body-base
- http://localhost:3001/docs/apis/jwt/_reconcile-request-body
- http://localhost:3001/docs/apis/jwt/issue-a-jwt
- http://localhost:3001/docs/apis/jwt/refresh-a-jwt
- http://localhost:3001/docs/apis/jwt/retrieve-public-keys
- http://localhost:3001/docs/apis/jwt/validate-a-jwt
- http://localhost:3001/docs/apis/jwt/vend-a-jwt
- http://localhost:3001/docs/extend/code/lambdas/testing

### load-tests (FusionAuth/fusionauth-load-tests) - Load testing
- http://localhost:3001/blog/hundreds-millions-entities
- http://localhost:3001/docs/cloud/operate/load-test
- http://localhost:3001/docs/operate/deploy/cluster

### localization (FusionAuth/fusionauth-localization) - Translations
- http://localhost:3001/blog/announcing-fusionauth-1-33
- http://localhost:3001/blog/announcing-fusionauth-1-39
- http://localhost:3001/blog/inteligov-fusionauth-sso
- http://localhost:3001/blog/theme-registration-form
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme
- http://localhost:3001/docs/customize/look-and-feel/localization
- http://localhost:3001/docs/customize/look-and-feel/simple-theme-editor
- http://localhost:3001/docs/get-started/core-concepts/localization-and-internationalization

### mcp-api (FusionAuth/fusionauth-mcp-api) - MCP server
- http://localhost:3001/blog/fusionauth-mcp-server
- http://localhost:3001/docs/get-started/download-and-install/development/mcp-server

### netcore-client (FusionAuth/fusionauth-netcore-client) - Client library
- http://localhost:3001/blog/top-forum-posts-mar-2021
- http://localhost:3001/docs/sdks/netcore
- http://localhost:3001/releases/v1-65-0

### node-cli (FusionAuth/fusionauth-node-cli) - CLI tool
- http://localhost:3001/articles/tokens/revoking-jwts
- http://localhost:3001/blog/fusionauth-cli-kickstart
- http://localhost:3001/docs/customize/cli
- http://localhost:3001/docs/extend/code/lambdas/testing

### openapi (FusionAuth/fusionauth-openapi) - API spec
- http://localhost:3001/docs/sdks/openapi

### openid-appauth-android (FusionAuth/openid-AppAuth-Android) - 3rd party dep
- http://localhost:3001/docs/get-started/quickstarts/app/quickstart-java-android-native

### php-client (FusionAuth/fusionauth-php-client) - Client library
- http://localhost:3001/blog/how-to-integrate-fusionauth-with-php
- http://localhost:3001/docs/sdks/php
- http://localhost:3001/releases/v1-55-1

### python-client (FusionAuth/fusionauth-python-client) - Client library
- http://localhost:3001/docs/sdks/python

### rack-jwt (FusionAuth/rack-jwt) - 3rd party dep
- http://localhost:3001/blog/custom-scopes-in-third-party-applications
- http://localhost:3001/docs/get-started/quickstarts/api/quickstart-ruby-on-rails-api

### render-blueprint (FusionAuth/fusionauth-render-blueprint) - Render blueprint
- http://localhost:3001/docs/get-started/marketplaces/render

### ruby-client (FusionAuth/fusionauth-ruby-client) - Client library
- http://localhost:3001/docs/sdks/ruby

### swift-sdk (FusionAuth/fusionauth-swift-sdk) - SDK
- http://localhost:3001/blog/swift-sdk-beta
- http://localhost:3001/docs/get-started/quickstarts/app/quickstart-swift-ios-native
- http://localhost:3001/docs/sdks/swift-sdk

### terraform-provider (FusionAuth/terraform-provider-fusionauth) - Terraform provider
- http://localhost:3001/docs/operate/deploy/terraform

### theme-helper (FusionAuth/fusionauth-theme-helper) - Theme tool
- http://localhost:3001/blog/fusionauth-cli
- http://localhost:3001/blog/treefort-uses-fusionauth-for-all-auth
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme

### theme-history (FusionAuth/fusionauth-theme-history) - Theme history
- http://localhost:3001/blog/fusionauth-cli
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme
- http://localhost:3001/docs/get-started/marketplaces/github-actions

### theme-history-updater (FusionAuth/fusionauth-theme-history-updater) - Theme tool
- http://localhost:3001/docs/get-started/marketplaces/github-actions

### theme-management (FusionAuth/fusionauth-theme-management) - Theme tool
- http://localhost:3001/blog/theme-registration-form
- http://localhost:3001/docs/lifecycle/register-users/advanced-registration-forms

### typescript-client (FusionAuth/fusionauth-typescript-client) - Client library
- http://localhost:3001/blog/10log-fusionauth
- http://localhost:3001/docs/extend/code/lambdas/testing
- http://localhost:3001/docs/sdks/typescript


## Local pages for easy clicking and quick human review

Below are all MDX files using LocalCode, LocalValue, LocalEmailCode, or LocalMarkdown.

### Blogs

- [6 indicators doing mocking wrong](http://localhost:3001/blog/6-indicators-doing-mocking-wrong)
- [Android end to end testing](http://localhost:3001/blog/android-end-to-end-testing)
- [Android SDK beta](http://localhost:3001/blog/android-sdk-beta)
- [Anonymous user](http://localhost:3001/blog/anonymous-user)
- [Backend for frontend](http://localhost:3001/blog/backend-for-frontend)
- [Custom scopes in third party applications](http://localhost:3001/blog/custom-scopes-in-third-party-applications)
- [ForgeRock password storage](http://localhost:3001/blog/forgerock-password-storage)
- [Get more value out of FusionAuth](http://localhost:3001/blog/get-more-value-out-of-fusionauth)
- [How to design OAuth scopes](http://localhost:3001/blog/how-to-design-oauth-scopes)
- [Identity verification before registration](http://localhost:3001/blog/identity-verification-before-registration)
- [JavaScript SDKs](http://localhost:3001/blog/javascript-sdks)
- [Modeling family and consents](http://localhost:3001/blog/modeling-family-and-consents)
- [Next.js single sign on](http://localhost:3001/blog/nextjs-single-sign-on)
- [Permify bulk permissions check](http://localhost:3001/blog/permify-bulk-permissions-check)
- [React example application](http://localhost:3001/blog/react-example-application)
- [Remix demo](http://localhost:3001/blog/remix-demo)
- [Securing React Native with OAuth](http://localhost:3001/blog/securing-react-native-with-oauth)
- [Spring and FusionAuth](http://localhost:3001/blog/spring-and-fusionauth)
- [Swift SDK beta](http://localhost:3001/blog/swift-sdk-beta)
- [To mock or not mock auth](http://localhost:3001/blog/to-mock-or-not-mock-auth)
- [Using identity provider links](http://localhost:3001/blog/using-identity-provider-links)

### Docs

- [Email](http://localhost:3001/docs/customize/email-and-messages/email-templates-replacement-variables)
- [WebAuthn](http://localhost:3001/docs/apis/webauthn)
- [Test](http://localhost:3001/docs/cloud/operate/test)
- [Lambdas testing](http://localhost:3001/docs/extend/code/lambdas/testing)
- [Custom password hashing](http://localhost:3001/docs/extend/code/password-hashes/custom-password-hashing)
- [Writing a plugin](http://localhost:3001/docs/extend/code/password-hashes/writing-a-plugin)
- [Kafka](http://localhost:3001/docs/extend/events-and-webhooks/kafka)
- [Signing](http://localhost:3001/docs/extend/events-and-webhooks/signing)
- [Writing a webhook](http://localhost:3001/docs/extend/events-and-webhooks/writing-a-webhook)
- [5 minute docker](http://localhost:3001/docs/extend/examples/5-minute-intro/5-minute-docker)
- [Controlling access MCP server](http://localhost:3001/docs/extend/examples/controlling-access-mcp-server)
- [Device limiting](http://localhost:3001/docs/extend/examples/device-limiting)
- [Modeling organizations](http://localhost:3001/docs/extend/examples/modeling-organizations)
- [Multi application dashboard](http://localhost:3001/docs/extend/examples/multi-application-dashboard)
- [Fine grained authorization](http://localhost:3001/docs/extend/fine-grained-authorization)
- [MCP server](http://localhost:3001/docs/get-started/download-and-install/development/mcp-server)
- [Docker](http://localhost:3001/docs/get-started/download-and-install/docker)
- [Kubernetes](http://localhost:3001/docs/get-started/download-and-install/kubernetes)
- [Docker configuration](http://localhost:3001/docs/get-started/download-and-install/reference/docker-configuration)

### Docs - Quickstarts

- [.NET API](http://localhost:3001/docs/get-started/quickstarts/api/quickstart-dotnet-api)
- [Golang API](http://localhost:3001/docs/get-started/quickstarts/api/quickstart-golang-api)
- [Java Spring Boot API](http://localhost:3001/docs/get-started/quickstarts/api/quickstart-java-springboot-api)
- [Ruby on Rails API](http://localhost:3001/docs/get-started/quickstarts/api/quickstart-ruby-on-rails-api)
- [Flutter native](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-flutter-native)
- [Java Android native](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-java-android-native)
- [Kotlin Android native](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-kotlin-android-native)
- [React Native](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-react-native)
- [Swift iOS native](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-swift-ios-native)
- [Swift iOS native AppAuth](http://localhost:3001/docs/get-started/quickstarts/app/quickstart-swift-ios-native-appauth)
- [React SPA](http://localhost:3001/docs/get-started/quickstarts/spa/react)
- [Express](http://localhost:3001/docs/get-started/quickstarts/web/express)
- [Golang web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-golang-web)
- [JavaScript Nuxt web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-javascript-nuxt-web)
- [JavaScript Remix web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-javascript-remix-web)
- [Java Spring Boot web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-java-springboot-web)
- [PHP Laravel web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-php-laravel-web)
- [PHP web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-php-web)
- [Python Django web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-python-django-web)
- [Python Flask web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-python-flask-web)
- [Rust Actix web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-rust-actix-web)
- [WordPress web](http://localhost:3001/docs/get-started/quickstarts/web/quickstart-wordpress-web)

### Docs - Start Here

- [Step 2](http://localhost:3001/docs/get-started/start-here/step-2)
- [Step 3](http://localhost:3001/docs/get-started/start-here/step-3)
- [Step 4](http://localhost:3001/docs/get-started/start-here/step-4)
- [Step 5](http://localhost:3001/docs/get-started/start-here/step-5)
- [Step 6](http://localhost:3001/docs/get-started/start-here/step-6)
- [Step 7](http://localhost:3001/docs/get-started/start-here/step-7)

### Docs - Use Cases

- [API consents platform](http://localhost:3001/docs/get-started/use-cases/api-consents-platform)
- [Machine to machine](http://localhost:3001/docs/get-started/use-cases/machine-to-machine)

### Docs - Lifecycle

- [Salesforce](http://localhost:3001/docs/lifecycle/authenticate-users/integrations/oidc/salesforce)
- [Logout session management](http://localhost:3001/docs/lifecycle/authenticate-users/logout-session-management)
- [WebAuthn passkeys](http://localhost:3001/docs/lifecycle/authenticate-users/passwordless/webauthn-passkeys)
- [Single sign on](http://localhost:3001/docs/lifecycle/authenticate-users/single-sign-on)
- [User actions](http://localhost:3001/docs/lifecycle/manage-users/user-actions)
- [Passport.js migration](http://localhost:3001/docs/lifecycle/migrate-users/framework-specific/passportjs)
- [Rails migration](http://localhost:3001/docs/lifecycle/migrate-users/framework-specific/rails)
- [Azure AD B2C migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/azureadb2c)
- [Cognito migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/cognito)
- [Firebase migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/firebase)
- [ForgeRock migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/forgerock)
- [Keycloak migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/keycloak)
- [PingOne migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/pingone)
- [Stytch migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/stytch)
- [Supabase migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/supabase)
- [WordPress migration](http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/wordpress)
- [SCIM SDK](http://localhost:3001/docs/lifecycle/migrate-users/scim/scim-sdk)
- [Anonymous user](http://localhost:3001/docs/lifecycle/register-users/anonymous-user)

### Docs - Operate

- [Terraform](http://localhost:3001/docs/operate/deploy/terraform)
- [Key master](http://localhost:3001/docs/operate/secure/key-master)

### Docs - SDKs

- [Android SDK](http://localhost:3001/docs/sdks/android-sdk)
- [Angular SDK](http://localhost:3001/docs/sdks/angular-sdk)
- [React SDK](http://localhost:3001/docs/sdks/react-sdk)
- [Swift SDK](http://localhost:3001/docs/sdks/swift-sdk)
- [Vue SDK](http://localhost:3001/docs/sdks/vue-sdk)
