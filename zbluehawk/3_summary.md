This branch, draft_bluehawkAllRepos, converts every use of `RemoteCode`, `RemoteValue`, and `RemoteContent` to `LocalCode`, `LocalValue`, `LocalEmailCode`, or `LocalMarkdown`. Source code tags are converted to Bluehawk (`snippet` instead of `tag::`). The only exception is articles and code changed in branches not yet merged (like some quickstarts done by Ritza), which have not been touched.

## Summary of work done

- ~120 MDX files changed - docs, blog, and emails
- 95 repositories imported to `extractedcode`.
- 63 source files updated to Bluehawk tags
- One source file had nested tags, which Bluehawk can't handle. They were deleted and the mdx file was update slightly: `astro/extractedcode/example-device-limit-simple/complete-application/src/index.ts` used by [astro/src/content/docs/extend/examples/device-limiting.mdx](http://localhost:3001/docs/extend/examples/device-limiting).
- [Emails](http://localhost:3001/docs/customize/email-and-messages/email-templates-replacement-variables) now use LocalEmailCode instead of RemoteCode or LocalCode. The emails are *pulled* in from FusionAuth and thus don't belong in the `extractedcode` folder, which is used to *push* repositories out. As LocalCode is now in an external repository, I could not update it to handle both situations.

## To do

- This branch was created from `main` on Monday the 14th. Changes after this date will need to be merged in carefully before this branch can be merged back to main.
- Snippets will not generate until Nathan accepts the pull request to remove symlinks, https://github.com/nathan-contino/astro-better-code-blocks/pull/1 (or you make the change manually locally yourself when building the project and don't update npm again to overwrite it)
- *QA*. The conversions were done with an LLM, with all code changes reviewed by Richard (me). Then I manually compared a few pages from live to local, checked the rendering of dozens of pages locally only, and got the LLM to right a script to find large html differences between all pages that used a `Remote` component between live and local. There were a few systemic errors that were quickly fixed. If Nathan is happy with the general idea of this branch, a more in depth human review and Claude review should be done.
- The Remote components have not been deleted yet. Once merged to main and finalized, they can be.
- The quickstart-express guide uses two repositories, one of which has no `repositoryUrl.txt`. This is a bit confusing. The repos should be merged or have a note explaining what's happening here.
- Many repositories don't belong in the docs repo because they are their own projects and not just examples, like the SDKs and client libraries, and need to use branches, which the docs repository does not support. Some repos also have their own github workflows, which need to be addressed and altered or removed before merging this branch into main. See the full list below in this article to review.

## Repos that possibly should not belong in docs

Review each URL to see if the `LocalCode` reference can be hardcoded instead so the repository can be removed from `extractedcode`.

### android-sdk (FusionAuth/fusionauth-android-sdk) - SDK
- http://localhost:3001/blog/android-end-to-end-testing [link]
- http://localhost:3001/blog/android-sdk-beta [snippet]
- http://localhost:3001/docs/sdks/android-sdk [snippet]

### example-client-libraries (FusionAuth/fusionauth-example-client-libraries) - Client lib examples
- http://localhost:3001/blog/dotnet-templates [link]
- http://localhost:3001/docs/sdks/netcore [link]

### example-github-actions (FusionAuth/fusionauth-example-github-actions) - CI example
- http://localhost:3001/docs/cloud/operate/test [snippet]

### go-client (FusionAuth/go-client) - Client library
- http://localhost:3001/blog/building-cli-app-with-device-grant-and-golang [link]
- http://localhost:3001/docs/sdks/go [link]

### homebrew-fusionauth (FusionAuth/homebrew-fusionauth) - Homebrew tap
- http://localhost:3001/blog/building-fusionauth-homebrew-formula [link]
- http://localhost:3001/docs/get-started/download-and-install/fusionauth-app [link]

### install (FusionAuth/fusionauth-install) - Install scripts
- (no references found in MDX files)

### issues (FusionAuth/fusionauth-issues) - Issue tracker
- http://localhost:3001/articles/authentication/fedcm [link]
- http://localhost:3001/blog/announcing-fusionauth-1-27 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-35 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-36 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-38 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-45 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-63 [link]
- http://localhost:3001/blog/auth-architecture-part2-tmb [link]
- http://localhost:3001/blog/backend-for-frontend [link]
- http://localhost:3001/blog/building-fusionauth-homebrew-formula [link]
- http://localhost:3001/blog/cimd-vs-dcr [link]
- http://localhost:3001/blog/clearspend-customizes-fusionauth [link]
- http://localhost:3001/blog/cybanetix-fusionauth-pci-dss [link]
- http://localhost:3001/blog/dolphinvc-fusionauth [link]
- http://localhost:3001/blog/fitt-finder-fusionauth [link]
- http://localhost:3001/blog/fusionauth-2024-year-in-review [link]
- http://localhost:3001/blog/fusionauth-family-model-consent-management [link]
- http://localhost:3001/blog/fusionauth-idpro-membership-benefits [link]
- http://localhost:3001/blog/fusionauth-lets-iot-firm-focus-their-app [link]
- http://localhost:3001/blog/fusionauth-passwordless [link]
- http://localhost:3001/blog/fusionauth-self-service-registration-typescript [link]
- http://localhost:3001/blog/fusionauth-update-saml [link]
- http://localhost:3001/blog/getting-started-with-email-templates [link]
- http://localhost:3001/blog/hundreds-millions-entities [link]
- http://localhost:3001/blog/identity-verification-before-registration [link]
- http://localhost:3001/blog/identiverse-conference-report [link]
- http://localhost:3001/blog/implementing-fusionauth-python [link]
- http://localhost:3001/blog/inteligov-fusionauth-sso [link]
- http://localhost:3001/blog/introducing-fusionauth-reactor-breached-password-detection [link]
- http://localhost:3001/blog/jerry-hopper-gdpr-arm-manuals [link]
- http://localhost:3001/blog/oggeh-fusionauth-gluu [link]
- http://localhost:3001/blog/open-office-hours-19-12-17 [link]
- http://localhost:3001/blog/seegno-thousands-tenants [link]
- http://localhost:3001/blog/softozor-fusionauth-hasura-kubernetes [link]
- http://localhost:3001/blog/tangany-fusionauth-self-hosted-regulatory [link]
- http://localhost:3001/blog/top-forum-posts-may-2021 [link]
- http://localhost:3001/blog/treefort-uses-fusionauth-for-all-auth [link]
- http://localhost:3001/blog/using-fusionauth-with-cockroachdb [link]
- http://localhost:3001/blog/what-is-fedcm [link]
- http://localhost:3001/docs/_shared/_data-field-data-type-changes [link]
- http://localhost:3001/docs/_shared/_scim-limits [link]
- http://localhost:3001/docs/_shared/_token-storage-options [link]
- http://localhost:3001/docs/apis [link]
- http://localhost:3001/docs/cloud/reference/limits [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes [link]
- http://localhost:3001/docs/customize/look-and-feel/application-specific-themes [link]
- http://localhost:3001/docs/extend/events-and-webhooks/writing-a-webhook [link]
- http://localhost:3001/docs/extend/examples/controlling-access-mcp-server [link]
- http://localhost:3001/docs/extend/examples/device-limiting [link]
- http://localhost:3001/docs/get-started/core-concepts/_configuration-limits [link]
- http://localhost:3001/docs/get-started/core-concepts/_downtime-upgrade-limitation [link]
- http://localhost:3001/docs/get-started/core-concepts/_multi-tenant-limitations [link]
- http://localhost:3001/docs/get-started/core-concepts/integration-points [link]
- http://localhost:3001/docs/get-started/core-concepts/types/entity-management [link]
- http://localhost:3001/docs/get-started/download-and-install/development/kickstart [link]
- http://localhost:3001/docs/get-started/download-and-install/reference/system-requirements [link]
- http://localhost:3001/docs/get-started/marketplaces [link]
- http://localhost:3001/docs/get-started/use-cases/authorization-hub [link]
- http://localhost:3001/docs/get-started/use-cases/machine-to-machine [link]
- http://localhost:3001/docs/lifecycle/authenticate-users/identity-providers [link]
- http://localhost:3001/docs/lifecycle/authenticate-users/integrations/saml/aiven [link]
- http://localhost:3001/docs/lifecycle/authenticate-users/logout-session-management [link]
- http://localhost:3001/docs/lifecycle/authenticate-users/passwordless/magic-links [link]
- http://localhost:3001/docs/lifecycle/manage-users/account-management/_account-logout [link]
- http://localhost:3001/docs/lifecycle/manage-users/verification/_common-questions-gating [link]
- http://localhost:3001/docs/lifecycle/migrate-users [link]
- http://localhost:3001/docs/lifecycle/migrate-users/_performance-tips [link]
- http://localhost:3001/docs/lifecycle/migrate-users/connectors [link]
- http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/_what-next-azure-ad-b2c [link]
- http://localhost:3001/docs/lifecycle/migrate-users/provider-specific/duende [link]
- http://localhost:3001/docs/operate/deploy [link]
- http://localhost:3001/docs/operate/deploy/proxy-setup [link]
- http://localhost:3001/docs/operate/deploy/upgrade [link]
- http://localhost:3001/docs/operate/deploy/user-support-guide [link]
- http://localhost:3001/docs/operate/monitor [link]
- http://localhost:3001/docs/operate/monitor/opentelemetry [link]
- http://localhost:3001/docs/operate/monitor/prometheus [link]
- http://localhost:3001/docs/operate/secure/key-rotation [link]
- http://localhost:3001/docs/operate/troubleshooting [link]
- http://localhost:3001/docs/reference/cookies [link]
- http://localhost:3001/docs/sdks [link]
- http://localhost:3001/docs/sdks/_how-to-use-client-libraries [link]
- http://localhost:3001/docs/sdks/_static-patch-note [link]
- http://localhost:3001/releases/v1-14-0 [link]
- http://localhost:3001/releases/v1-19-0 [link]
- http://localhost:3001/releases/v1-30-0 [link]
- http://localhost:3001/releases/v1-45-0 [link]
- http://localhost:3001/releases/v1-60-1 [link]

### java-client (FusionAuth/fusionauth-java-client) - Client library
- http://localhost:3001/blog/using-java-to-manage-fusionauth [link]
- http://localhost:3001/docs/operate/deploy/_client-library-versioning [link]
- http://localhost:3001/docs/sdks/java [link]

### javascript-sdk (FusionAuth/fusionauth-javascript-sdk) - SDK
- http://localhost:3001/docs/get-started/quickstarts/spa/react [link]
- http://localhost:3001/docs/sdks/angular-sdk [snippet]
- http://localhost:3001/docs/sdks/react-sdk [snippet]
- http://localhost:3001/docs/sdks/vue-sdk [snippet]

### jwt (FusionAuth/fusionauth-jwt) - JWT library
- http://localhost:3001/blog/top-forum-posts-apr-2021 [link]
- http://localhost:3001/docs/apis/_shared/_refresh-token-response-body-base [snippet]
- http://localhost:3001/docs/apis/jwt/_reconcile-request-body [snippet]
- http://localhost:3001/docs/apis/jwt/issue-a-jwt [snippet]
- http://localhost:3001/docs/apis/jwt/refresh-a-jwt [snippet]
- http://localhost:3001/docs/apis/jwt/retrieve-public-keys [snippet]
- http://localhost:3001/docs/apis/jwt/validate-a-jwt [snippet]
- http://localhost:3001/docs/apis/jwt/vend-a-jwt [snippet]
- http://localhost:3001/docs/extend/code/lambdas/testing [snippet]

### load-tests (FusionAuth/fusionauth-load-tests) - Load testing
- http://localhost:3001/blog/hundreds-millions-entities [link]
- http://localhost:3001/docs/cloud/operate/load-test [link]
- http://localhost:3001/docs/operate/deploy/cluster [link]

### localization (FusionAuth/fusionauth-localization) - Translations
- http://localhost:3001/blog/announcing-fusionauth-1-33 [link]
- http://localhost:3001/blog/announcing-fusionauth-1-39 [link]
- http://localhost:3001/blog/inteligov-fusionauth-sso [link]
- http://localhost:3001/blog/theme-registration-form [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme [link]
- http://localhost:3001/docs/customize/look-and-feel/localization [link]
- http://localhost:3001/docs/customize/look-and-feel/simple-theme-editor [link]
- http://localhost:3001/docs/get-started/core-concepts/localization-and-internationalization [link]

### mcp-api (FusionAuth/fusionauth-mcp-api) - MCP server
- http://localhost:3001/blog/fusionauth-mcp-server [link]
- http://localhost:3001/docs/get-started/download-and-install/development/mcp-server [snippet]

### netcore-client (FusionAuth/fusionauth-netcore-client) - Client library
- http://localhost:3001/blog/top-forum-posts-mar-2021 [link]
- http://localhost:3001/docs/sdks/netcore [link]
- http://localhost:3001/releases/v1-65-0 [link]

### node-cli (FusionAuth/fusionauth-node-cli) - CLI tool
- http://localhost:3001/articles/tokens/revoking-jwts [link]
- http://localhost:3001/blog/fusionauth-cli-kickstart [link]
- http://localhost:3001/docs/customize/cli [link]
- http://localhost:3001/docs/extend/code/lambdas/testing [link]

### openapi (FusionAuth/fusionauth-openapi) - API spec
- http://localhost:3001/docs/sdks/openapi [link]

### openid-appauth-android (FusionAuth/openid-AppAuth-Android) - 3rd party dep
- http://localhost:3001/docs/get-started/quickstarts/app/quickstart-java-android-native [link]

### php-client (FusionAuth/fusionauth-php-client) - Client library
- http://localhost:3001/blog/how-to-integrate-fusionauth-with-php [link]
- http://localhost:3001/docs/sdks/php [link]
- http://localhost:3001/releases/v1-55-1 [link]

### python-client (FusionAuth/fusionauth-python-client) - Client library
- http://localhost:3001/docs/sdks/python [link]

### rack-jwt (FusionAuth/rack-jwt) - 3rd party dep
- http://localhost:3001/blog/custom-scopes-in-third-party-applications [link]
- http://localhost:3001/docs/get-started/quickstarts/api/quickstart-ruby-on-rails-api [link]

### render-blueprint (FusionAuth/fusionauth-render-blueprint) - Render blueprint
- http://localhost:3001/docs/get-started/marketplaces/render [link]

### ruby-client (FusionAuth/fusionauth-ruby-client) - Client library
- http://localhost:3001/docs/sdks/ruby [link]

### swift-sdk (FusionAuth/fusionauth-swift-sdk) - SDK
- http://localhost:3001/blog/swift-sdk-beta [snippet]
- http://localhost:3001/docs/get-started/quickstarts/app/quickstart-swift-ios-native [link]
- http://localhost:3001/docs/sdks/swift-sdk [snippet]

### terraform-provider (FusionAuth/terraform-provider-fusionauth) - Terraform provider
- http://localhost:3001/docs/operate/deploy/terraform [link]

### theme-helper (FusionAuth/fusionauth-theme-helper) - Theme tool
- http://localhost:3001/blog/fusionauth-cli [link]
- http://localhost:3001/blog/treefort-uses-fusionauth-for-all-auth [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme [link]

### theme-history (FusionAuth/fusionauth-theme-history) - Theme history
- http://localhost:3001/blog/fusionauth-cli [link]
- http://localhost:3001/docs/customize/look-and-feel/advanced-themes/upgrade-advanced-theme [link]
- http://localhost:3001/docs/get-started/marketplaces/github-actions [link]

### theme-history-updater (FusionAuth/fusionauth-theme-history-updater) - Theme tool
- http://localhost:3001/docs/get-started/marketplaces/github-actions [link]

### theme-management (FusionAuth/fusionauth-theme-management) - Theme tool
- http://localhost:3001/blog/theme-registration-form [link]
- http://localhost:3001/docs/lifecycle/register-users/advanced-registration-forms [link]

### typescript-client (FusionAuth/fusionauth-typescript-client) - Client library
- http://localhost:3001/blog/10log-fusionauth [link]
- http://localhost:3001/docs/extend/code/lambdas/testing [link]
- http://localhost:3001/docs/sdks/typescript [link]

