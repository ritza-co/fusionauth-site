# Bluehawk Snippet Migration Tracker

## Overview
This file tracks the migration from remote components to local components and from old-style tags to bluehawk-style snippets.

### Migration Tasks
1. **RemoteCode → LocalCode**: Convert 94 files using RemoteCode to use local code snippets
2. **RemoteValue → LocalValue**: Convert 3 files using RemoteValue to use LocalValue
3. **RemoteContent → LocalMarkdown**: Convert 9 files using RemoteContent to use LocalMarkdown
4. **Old-style tags → Bluehawk snippets**: Convert 63 files with `tag::`/`end::` markers to `:snippet-start:`/`:snippet-end:` markers

---

## RemoteCode Files (94 files)

These files use `<RemoteCode>` to fetch code from external URLs. Convert to use local snippets from `extractedcode/`.

- [ ] apis/users/import.mdx
- [ ] cloud/operate/test.mdx
- [ ] cloud/reference/disaster-recovery.mdx
- [ ] customize/look-and-feel/client-side-password-rule-validation.mdx
- [ ] extend/code/password-hashes/custom-password-hashing.mdx
- [ ] extend/code/password-hashes/writing-a-plugin.mdx
- [ ] extend/events-and-webhooks/kafka/index.mdx
- [ ] extend/events-and-webhooks/signing.mdx
- [ ] extend/events-and-webhooks/webhook-event-log.mdx
- [ ] extend/events-and-webhooks/writing-a-webhook.mdx
- [ ] extend/examples/5-minute-intro/_5-minute-configure-node-application.mdx
- [ ] extend/examples/5-minute-intro/5-minute-docker.mdx
- [ ] extend/examples/5-minute-intro/_5-minute-logout.mdx
- [ ] extend/examples/5-minute-intro/_5-minute-store-user-object.mdx
- [ ] extend/examples/controlling-access-mcp-server.mdx
- [ ] extend/examples/device-limiting.mdx
- [ ] extend/examples/modeling-organizations.mdx
- [ ] extend/examples/multi-application-dashboard.mdx
- [ ] extend/fine-grained-authorization.mdx
- [ ] get-started/download-and-install/docker.mdx
- [ ] get-started/download-and-install/kubernetes/index.mdx
- [ ] get-started/download-and-install/reference/docker-configuration.mdx
- [ ] get-started/quickstarts/api/quickstart-javascript-express-api.mdx
- [ ] get-started/quickstarts/api/quickstart-php-laravel-api.mdx
- [ ] get-started/quickstarts/app/quickstart-flutter-native.mdx
- [ ] get-started/quickstarts/app/quickstart-java-android-native.mdx
- [ ] get-started/quickstarts/app/quickstart-kotlin-android-native.mdx
- [ ] get-started/quickstarts/app/quickstart-react-native.mdx
- [ ] get-started/quickstarts/app/quickstart-swift-ios-native-appauth.mdx
- [ ] get-started/quickstarts/app/quickstart-swift-ios-native.mdx
- [ ] get-started/quickstarts/spa/quickstart-javascript-angular-web.mdx
- [ ] get-started/quickstarts/spa/quickstart-javascript-vue-web.mdx
- [ ] get-started/quickstarts/web/quickstart-dotnet-web.mdx
- [ ] get-started/quickstarts/web/quickstart-javascript-nextjs-web.mdx
- [ ] get-started/quickstarts/web/quickstart-javascript-nuxt-web.mdx
- [ ] get-started/quickstarts/web/quickstart-java-springboot-web.mdx
- [ ] get-started/quickstarts/web/quickstart-php-drupal-web.mdx
- [ ] get-started/quickstarts/web/quickstart-python-flask-web.mdx
- [ ] get-started/quickstarts/web/quickstart-ruby-rails-web.mdx
- [ ] get-started/start-here/step-2.mdx
- [ ] get-started/start-here/step-3.mdx
- [ ] get-started/start-here/step-4.mdx
- [ ] get-started/start-here/step-5.mdx
- [ ] get-started/start-here/step-6.mdx
- [ ] get-started/start-here/step-7.mdx
- [ ] get-started/use-cases/api-consents-platform.mdx
- [ ] get-started/use-cases/machine-to-machine.mdx
- [ ] lifecycle/authenticate-users/integrations/oidc/salesforce.mdx
- [ ] lifecycle/authenticate-users/integrations/saml/aiven.mdx
- [ ] lifecycle/authenticate-users/logout-session-management.mdx
- [ ] lifecycle/authenticate-users/passwordless/webauthn-passkeys.mdx
- [ ] lifecycle/authenticate-users/single-sign-on.mdx
- [ ] lifecycle/manage-users/search/user-search-with-elasticsearch.mdx
- [ ] lifecycle/manage-users/user-actions.mdx
- [ ] lifecycle/migrate-users/framework-specific/passportjs.mdx
- [ ] lifecycle/migrate-users/framework-specific/rails.mdx
- [ ] lifecycle/migrate-users/provider-specific/azureadb2c.mdx
- [ ] lifecycle/migrate-users/provider-specific/cognito.mdx
- [ ] lifecycle/migrate-users/provider-specific/firebase.mdx
- [ ] lifecycle/migrate-users/provider-specific/forgerock.mdx
- [ ] lifecycle/migrate-users/provider-specific/keycloak.mdx
- [ ] lifecycle/migrate-users/provider-specific/pingone.mdx
- [ ] lifecycle/migrate-users/provider-specific/stytch.mdx
- [ ] lifecycle/migrate-users/provider-specific/supabase.mdx
- [ ] lifecycle/migrate-users/provider-specific/wordpress.mdx
- [ ] lifecycle/migrate-users/scim/scim-sdk.mdx
- [ ] lifecycle/register-users/anonymous-user.mdx
- [ ] operate/deploy/terraform.mdx
- [ ] operate/secure/key-master.mdx
- [ ] operate/secure/key-rotation.mdx
- [ ] _shared/email/_breached-password-html.mdx
- [ ] _shared/email/_breached-password-txt.mdx
- [ ] _shared/email/_change-password-html.mdx
- [ ] _shared/email/_change-password-txt.mdx
- [ ] _shared/email/_confirm-child-html.mdx
- [ ] _shared/email/_confirm-child-txt.mdx
- [ ] _shared/email/_coppa-email-plus-notice-html.mdx
- [ ] _shared/email/_coppa-email-plus-notice-txt.mdx
- [ ] _shared/email/_coppa-notice-html.mdx
- [ ] _shared/email/_coppa-notice-txt.mdx
- [ ] _shared/email/_email-verification-html.mdx
- [ ] _shared/email/_email-verification-txt.mdx
- [ ] _shared/email/_parent-registration-html.mdx
- [ ] _shared/email/_parent-registration-txt.mdx
- [ ] _shared/email/_registration-verification-html.mdx
- [ ] _shared/email/_registration-verification-txt.mdx
- [ ] _shared/email/_threat-detected-html.mdx
- [ ] _shared/email/_threat-detected-txt.mdx
- [ ] _shared/email/_two-factor-add-html.mdx
- [ ] _shared/email/_two-factor-add-txt.mdx
- [ ] _shared/email/_two-factor-login-html.mdx
- [ ] _shared/email/_two-factor-login-txt.mdx
- [ ] _shared/email/_two-factor-remove-html.mdx
- [ ] _shared/email/_two-factor-remove-txt.mdx

**Progress: 0/94**

---

## RemoteValue Files (3 files)

These files use `<RemoteValue>` to extract values from remote files. Convert to use `<LocalValue>`.

- [ ] get-started/quickstarts/api/quickstart-php-laravel-api.mdx
- [ ] get-started/quickstarts/app/quickstart-react-native.mdx
- [ ] get-started/quickstarts/web/quickstart-ruby-rails-web.mdx

**Progress: 0/3**

---

## RemoteContent Files (9 files)

These files use `<RemoteContent>` to fetch markdown from remote files. Convert to use `<LocalMarkdown>`.

- [ ] customize/look-and-feel/client-side-password-rule-validation.mdx
- [ ] get-started/download-and-install/development/mcp-server.mdx
- [ ] get-started/quickstarts/app/quickstart-kotlin-android-native.mdx
- [ ] get-started/quickstarts/app/quickstart-swift-ios-native.mdx
- [ ] sdks/android-sdk.mdx
- [ ] sdks/angular-sdk.mdx
- [ ] sdks/react-sdk.mdx
- [ ] sdks/swift-sdk.mdx
- [ ] sdks/vue-sdk.mdx

**Progress: 0/9**

---

## Old-Style Tag Files (63 files with referenced tags)

These files contain `tag::`/`end::` markers that are actively used by documentation. Convert to bluehawk-style `:snippet-start:`/`:snippet-end:` markers.

- [ ] android-sdk/README.md
- [ ] contrib/Password Hashing Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleFirebaseScryptPasswordEncryptor.java
- [ ] contrib/Password Hashing Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleStytchScryptPasswordEncryptor.java
- [ ] example-5-minute-guide/routes/index.js
- [ ] example-5-minute-guide/views/index.pug
- [ ] example-anonymous-user/complete-application/server.py
- [ ] example-api-consents-platform/changebank-apis/app.js
- [ ] example-api-consents-platform/changebank-apis/routes/index.js
- [ ] example-api-consents-platform/changebank-apis/services/hasScope.js
- [ ] example-api-consents-platform/create-application/create-application.js
- [ ] example-api-consents-platform/moneyscope-application/src/index.ts
- [ ] example-device-limit-friendly/complete-application/src/index.ts
- [ ] example-device-limit-simple/complete-application/src/index.ts
- [ ] example-fine-grained-authorization/app/src/index.ts
- [ ] example-fine-grained-authorization/docker-compose.yml
- [ ] example-fine-grained-authorization/permify-setup/src/loaddata.ts
- [ ] example-full-user-search/client-side-password-rules/README.md
- [ ] example-get-started/src/index.mts
- [ ] example-get-started/src/sdk.ts
- [ ] example-get-started/tests/example.spec.ts
- [ ] example-javascript-webhooks/simple/app.js
- [ ] example-machine-to-machine/apis/app.js
- [ ] example-machine-to-machine/request-api/request-news.js
- [ ] example-modeling-organizations/complete-application/app.js
- [ ] example-modeling-organizations/complete-application/middleware/checkGrantPermissions.js
- [ ] example-modeling-organizations/complete-application/routes/admin.js
- [ ] example-modeling-organizations/complete-application/routes/billing.js
- [ ] example-modeling-organizations/complete-application/routes/index.js
- [ ] example-modeling-organizations/complete-application/routes/users.js
- [ ] example-node-centralized-sessions/changebankforum/src/index.ts
- [ ] example-node-centralized-sessions/changebank/src/index.ts
- [ ] example-node-sso/pied-piper/routes/index.js
- [ ] example-protected-mcp-server/protected-local-mcp/mcp-server/server.py
- [ ] example-protected-mcp-server/protected-local-mcp/setup/setup_clients.py
- [ ] example-protected-mcp-server/unprotected-local-mcp/mcp-server/server.py
- [ ] example-protected-mcp-server/unprotected-local-mcp/setup/setup_clients.py
- [ ] example-scim-integration/src/main/java/io/fusionauth/example/scim/ScimExample.java
- [ ] example-terraform/examples/create/main.tf
- [ ] example-terraform/examples/data-source/main.tf
- [ ] example-terraform/examples/import/main.tf
- [ ] example-user-actions-guide/app.js
- [ ] example-user-actions-guide/routes/index.js
- [ ] example-user-actions-guide/views/index.pug
- [ ] homebrew-fusionauth/README.md
- [ ] javascript-sdk/packages/sdk-angular/docs/README.md
- [ ] javascript-sdk/packages/sdk-angular/README.md
- [ ] javascript-sdk/packages/sdk-react/docs/README.md
- [ ] javascript-sdk/packages/sdk-react/README.md
- [ ] javascript-sdk/packages/sdk-vue/docs/README.md
- [ ] javascript-sdk/packages/sdk-vue/generated/README.adoc
- [ ] javascript-sdk/packages/sdk-vue/README.md
- [ ] mcp-api/packages/mcp-api/README.md
- [ ] mcp-api/README.md
- [ ] php-client/README.md
- [ ] python-client/README.md
- [ ] quickstart-flutter-native/complete-application/android/app/build.gradle
- [ ] quickstart-flutter-native/complete-application/pubspec.yaml
- [ ] quickstart-kotlin-android-native/README.md
- [ ] quickstart-python-flask-web/complete-application/server.py
- [ ] quickstart-swift-ios-native/README.md
- [ ] ruby-client/README.md
- [ ] swift-sdk/README.md
- [ ] terraform-provider/docs/guides/handling_default_resources.md

**Progress: 0/63**

---

## Unreferenced Tag Files (9 files)

These files contain only tags that are NOT referenced by any documentation. Review needed to determine if tags should be converted or removed.

- [ ] android-sdk/CONTRIBUTING.md (tag: forDocSiteContributing)
- [ ] example-get-started/templates/account.html (tag: login -->)
- [ ] example-get-started/templates/home.html (tag: logout -->)
- [ ] example-kickstart/identity-verification/lambdas/fideo.js (tag: ForgerockPasswordHash)
- [ ] example-modeling-organizations/complete-application/middleware/loadGrants.js (tag: loadGrantsMW)
- [ ] homebrew-fusionauth/CONTRIBUTING.md (tag: forDocSiteContributing)
- [ ] import-scripts/forgerock/import.rb (tag: security)
- [ ] quickstart-kotlin-android-native/TESTING.md (tag: forDocSiteE2ETest)
- [ ] swift-sdk/CONTRIBUTING.md (tag: forDocSiteContributing)

**Progress: 0/9**

---

## Summary

| Task | Total | Completed | Remaining |
|------|-------|-----------|-----------|
| RemoteCode → LocalCode | 94 | 0 | 94 |
| RemoteValue → LocalValue | 3 | 0 | 3 |
| RemoteContent → LocalMarkdown | 9 | 0 | 9 |
| Old-style tags → Bluehawk | 63 | 0 | 63 |
| Unreferenced tags review | 9 | 0 | 9 |
| **TOTAL** | **178** | **0** | **178** |

---

## Notes

### Component Mapping
- `<RemoteCode url="...">` → Use bluehawk snippets with `:snippet-start:` markers
- `<RemoteValue url="..." selector="...">` → `<LocalValue path="..." selector="...">`
- `<RemoteContent url="...">` → `<LocalMarkdown src="...">`

### Path Mapping
- Remote URLs like `https://raw.githubusercontent.com/FusionAuth/fusionauth-example-xxx/main/...` → Local paths like `extractedcode/example-xxx/...`

### Tag Conversion
- Old: `tag::tagName[]` / `end::tagName[]`
- New: `:snippet-start: tagName` / `:snippet-end:`
