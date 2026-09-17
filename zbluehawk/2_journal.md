# Bluehawk Snippet Migration Tracker

### Key Information

#### Component to Use
Use `astro-better-code-snippet-extractor/ExtractedCode.astro` for code snippets (NOT LocalCode.astro which was removed):
```astro
import LocalCode from 'astro-better-code-snippet-extractor/ExtractedCode.astro';
<LocalCode src="repo-name/path/to/file.js" lang="javascript" />
```

**IMPORTANT: Always put the `<LocalCode ... />` component on a single line. Never use multi-line format like:**
```astro
<LocalCode lang="javascript"
            src="repo-name/path/to/file.js"
            title="Title"
            />
```
**Instead use:**
```astro
<LocalCode lang="javascript" src="repo-name/path/to/file.js" title="Title" />
```

#### Conversion Patterns

**Pattern 1: RemoteCode → LocalCode**
```astro
# OLD:
import RemoteCode from 'src/components/RemoteCode.astro';
<RemoteCode url={frontmatter.codeRoot + "/path/to/file.js"} lang="javascript" />

# NEW:
import LocalCode from 'astro-better-code-snippet-extractor/ExtractedCode.astro';
<LocalCode src="repo-name/path/to/file.js" lang="javascript" />
```

**Pattern 2: Old-style tags → Bluehawk format**
```javascript
// OLD (in source files like README.md, .js, .py, etc.):
// tag::tagName[]
code here
// end::tagName[]

// NEW:
// :snippet-start: tagName
code here
// :snippet-end:
```

**Pattern 3: RemoteContent → LocalMarkdown**
```astro
# OLD:
import RemoteContent from 'src/components/RemoteContent.astro';
<RemoteContent url="https://raw.githubusercontent.com/..." tags="forDocSite" />

# NEW:
import LocalMarkdown from 'src/components/LocalMarkdown.astro';
<LocalMarkdown src="repo-name/README.snippet.forDocSite.md" />
```

**Pattern 4: RemoteValue → LocalValue**
```astro
# OLD:
import RemoteValue from 'src/components/RemoteValue/RemoteValue.astro';
<RemoteValue url={frontmatter.codeRoot + "/kickstart/kickstart.json"} selector="$.variables.userEmail" />

# NEW:
import { LocalValue } from 'src/components/LocalValue/LocalValue.astro';
<LocalValue path="repo-name/kickstart/kickstart.json" selector="$.variables.userEmail" />
```

### Path Mapping
- Remote URLs: `https://raw.githubusercontent.com/FusionAuth/fusionauth-<repo-name>/main/<path>`
- Local paths: `<repo-name>/<path>` (relative to `astro/extractedcode/`)
- Snippet paths: `<repo-name>/<filename>.snippet.<tagname>.<extension>` (auto-generated in `astro/src/generated-code-snippets/`)
- **IMPORTANT**: The `fusionauth-` prefix is STRIPPED from folder names. E.g. URL `fusionauth-example-scim-integration` → local folder `example-scim-integration`. Check `ls astro/extractedcode/` if unsure.

### Tag Conversion Rules

**When the original RemoteCode had `tags="tagName"`:**
```astro
# OLD:
<RemoteCode url={frontmatter.codeRoot + "/path/to/file.js"} lang="javascript" tags="myTag" />

# NEW (reference the snippet file):
<LocalCode src="repo-name/path/to/file.js.snippet.myTag.js" lang="javascript" />
```

**When the original RemoteCode had NO tags:**
```astro
# OLD:
<RemoteCode url={frontmatter.codeRoot + "/path/to/file.js"} lang="javascript" />

# NEW (reference the full file):
<LocalCode src="repo-name/path/to/file.js" lang="javascript" />
```

**Source file tag conversion:**
```javascript
// OLD (in source files):
// tag::myTag[]
code here
// end::myTag[]

// NEW:
// :snippet-start: myTag
code here
// :snippet-end:
```

The snippet files are auto-generated from the `:snippet-start:` tags. You only need to:
1. Convert the tags in the source files from `tag::` to `:snippet-start:`
2. Reference the correct path in the MDX file (with or without `.snippet.<tagname>.` depending on whether the original had tags)

### Important Notes
1. **Snippet files are auto-generated** - you don't create them, just reference them with the pattern `<repo>/<filename>.snippet.<tagname>.<extension>`
2. **LocalValue component exists** at `astro/src/components/LocalValue/LocalValue.astro`
3. **LocalMarkdown component exists** at `astro/src/components/LocalMarkdown.astro`
4. **All source repos are in** `astro/extractedcode/` directory
5. **Never commit to git** or run npm/docker commands
6. **Update this file** as you complete tasks to track progress
7. **NEVER assume repos need downloading** - always `ls astro/extractedcode/` first. The `fusionauth-` prefix is stripped from folder names.
8. **Check git history** if unsure whether a file was converted in another branch: `git log --all -- <filepath>` (never checkout or commit)

### Lessons Learned (CRITICAL - READ BEFORE CONTINUING)

#### File Editing Rules
- **NEVER use sed for file editing** - it can accidentally remove content like `[]` from Python code
- **Use file edit tools** (Edit tool) for all file modifications
- **NEVER run destructive git commands** - no `git checkout`, `git restore`, `git reset`, etc. Only read-only git operations (git log, git show, git diff)
- **NEVER run npm or docker commands** - this is a documentation migration, not a build

#### Skip List Rules
- **Skip list = files done in OTHER branches only** - NOT files converted in current branch (draft_bluehawkAllRepos)
- **Folder names can change between branches** - match by filename and content, not just full path
- **Check if branches are merged** - use `git log --oneline --merges HEAD` to see merge history
- **Verify with actual git commands** - don't assume, use `git show <branch>:<filepath>` to check file state in each branch
- **Bluehawk markers to search for**: `:snippet-start:`, `LocalCode`, `LocalValue`, `LocalMarkdown`

#### Branch Analysis Rules
- **Current branch**: draft_bluehawkAllRepos - files converted here should NOT be in skip list
- **Other bluehawk branches**: bluehawkCodeExamples, bluehawkLambdas, bluehawkQuickstartLaravelWeb, etc.
- **Check all branches from past year** - use `git branch -a` and filter by commit date
- **For each branch, check**:
  1. Does it have files with bluehawk markers?
  2. Has it been merged into current branch? (check git log --merges)
  3. What's the actual file state? (use git show, not assumptions)

#### Tag Conversion Rules
- **Old-style tags**: `tag::tagName[]` / `end::tagName[]`
- **New-style tags**: `:snippet-start: tagName` / `:snippet-end:` (NO tag name on end tag!)
- **Comment styles vary**: `//`, `#`, `<!-- -->` - match the file's comment style
- **End tags have NO tag name** - just `:snippet-end:`, not `:snippet-end: tagName`
- **Search ALL file types** - never use `--include` filters that exclude files. Check .md, .java, .ts, .js, .py, .yml, .json, .ftl, etc.

#### Common Mistakes to Avoid
1. Don't confuse "files I converted in this branch" with "files in other branches"
2. Don't use sed to convert tags - it can break code syntax
3. Don't assume folder names are the same across branches
4. Don't add files to skip list without verifying they exist in OTHER branches
5. Don't run git checkout/restore - only read-only git operations
6. Don't forget to check if branches have been merged before deciding what to skip

---

## Overview
This file tracks the migration from remote components to local components and from old-style tags to bluehawk-style snippets.

### Migration Tasks
1. **RemoteCode → LocalCode**: Convert files using RemoteCode to use local code snippets
2. **RemoteValue → LocalValue**: Convert files using RemoteValue to use LocalValue
3. **RemoteContent → LocalMarkdown**: Convert files using RemoteContent to use LocalMarkdown
4. **Old-style tags → Bluehawk snippets**: Convert files with `tag::`/`end::` markers to `:snippet-start:`/`:snippet-end:` markers

### SKIP LIST - Already Done in Other Branches
The following files are already converted in other branches. **DO NOT TOUCH THESE FILES:**

*Generated from 141 branches (excluding draft_bluehawkAllRepos)*
*Merged branches: 2 | Not merged branches: 139*

**MDX files done in other branches:**
- apis/users/import.mdx (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)
- apis/webauthn.mdx (not merged: api-docs-improvements-2, draft-bluehawkQuickstartGoApi, draft-bluehawkQuickstartMigrations (and 20 more))
- apis/webauthn/index.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 32 more))
- customize/look-and-feel/client-side-password-rule-validation.mdx (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)
- extend/code/lambdas/testing.mdx (merged: main | not merged: bluehawkCodeExamples, bluehawkLambdas, bluehawk_quickstartLaravelApi (and 7 more))
- extend/events-and-webhooks/signing.mdx (not merged: draft-codeSnippetPoc)
- get-started/quickstarts/api/quickstart-dotnet-api.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 12 more))
- get-started/quickstarts/api/quickstart-golang-api.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 24 more))
- get-started/quickstarts/api/quickstart-java-springboot-api.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 12 more))
- get-started/quickstarts/api/quickstart-javascript-express-api.mdx (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- get-started/quickstarts/api/quickstart-php-laravel-api.mdx (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- get-started/quickstarts/api/quickstart-ruby-on-rails-api.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 12 more))
- get-started/quickstarts/spa/quickstart-javascript-angular-web.mdx (not merged: draft_bluehawkAngular)
- get-started/quickstarts/spa/quickstart-javascript-vue-web.mdx (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- get-started/quickstarts/spa/react.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 40 more))
- get-started/quickstarts/web/express.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 37 more))
- get-started/quickstarts/web/quickstart-dotnet-web.mdx (not merged: draft_DotNetWebBluehawkMigration)
- get-started/quickstarts/web/quickstart-golang-web.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 20 more))
- get-started/quickstarts/web/quickstart-javascript-nextjs-web.mdx (not merged: draft-bluehawkQuickstartMigrations, draft-bluehawkQuickstartNextjs, draft-bluehawkQuickstartReact (and 4 more))
- get-started/quickstarts/web/quickstart-javascript-remix-web.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 12 more))
- get-started/quickstarts/web/quickstart-php-drupal-web.mdx (not merged: draft_drupalBluehawk)
- get-started/quickstarts/web/quickstart-php-laravel-web.mdx (merged: main | not merged: bluehawkCodeExamples, bluehawkQuickstartLaravelWeb, bluehawk_quickstartLaravelApi (and 7 more))
- get-started/quickstarts/web/quickstart-php-web.mdx (merged: main | not merged: bluehawkCodeExamples, bluehawkQuickstartPhp, bluehawk_quickstartLaravelApi (and 7 more))
- get-started/quickstarts/web/quickstart-python-django-web.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 12 more))
- get-started/quickstarts/web/quickstart-ruby-rails-web.mdx (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- get-started/quickstarts/web/quickstart-rust-actix-web.mdx (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 22 more))
- get-started/quickstarts/web/quickstart-wordpress-web.mdx (merged: main | not merged: bluehawkCodeExamples, bluehawkWordpress, bluehawk_quickstartLaravelApi (and 7 more))
- lifecycle/authenticate-users/integrations/saml/aiven.mdx (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)
- lifecycle/authenticate-users/passwordless/webauthn-passkeys.mdx (not merged: migrate-local-doc-includes-ws1)
- lifecycle/manage-users/search/user-search-with-elasticsearch.mdx (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)
- operate/secure/key-rotation.mdx (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)

**Source files done in other branches:**
- README.md (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 46 more))
- astro/src/components/LocalValue/LocalValue.astro (not merged: bluehawk_quickstartLaravelApi, draft_DotNetWebBluehawkMigration, draft_drupalBluehawk (and 3 more))
- example-scripts/client-side-password-rules/README.md (not merged: bluehawkCodeExamples, fix/example-scripts-extractedcode)
- example-testing-lambdas/tests/integration.spec.js (merged: main | not merged: bluehawkCodeExamples, bluehawkLambdas, bluehawk_quickstartLaravelApi (and 8 more))
- fusionauth-example-javascript-webauthn/base64url-to-buffer.js (not merged: draft-bluehawkQuickstartReact, draft_DotNetWebBluehawkMigration, nathans-api-docs-improvements (and 20 more))
- fusionauth-example-javascript-webauthn/buffer-to-base64url.js (not merged: draft-bluehawkQuickstartReact, draft_DotNetWebBluehawkMigration, nathans-api-docs-improvements (and 20 more))
- fusionauth-quickstart-golang-api-main/complete-application/main.go (not merged: draft-bluehawkQuickstartGoApi, draft-bluehawkQuickstartMigrations, draft-bluehawkQuickstartReact (and 1 more))
- fusionauth-quickstart-javascript-express-api/complete-application/app.js (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- fusionauth-quickstart-ruby-on-rails-web/complete-app/Gemfile (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- fusionauth-quickstart-ruby-on-rails-web/complete-app/app/views/layouts/application.html.erb (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- fusionauth-quickstart-ruby-on-rails-web/complete-app/config/environments/development.rb (not merged: draft_DotNetWebBluehawkMigration, draft_drupalBluehawk, quickstartMigrationToBluehawk)
- quickstart-golang-api/complete-application/main.go (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 21 more))
- quickstart-golang-web/base-app.go (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 21 more))
- quickstart-golang-web/complete-application/main.go (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 21 more))
- quickstart-php-laravel-api/complete-application/.env (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- quickstart-php-laravel-api/complete-application/.env.example (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- quickstart-php-laravel-api/complete-application/config/app.php (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- quickstart-php-laravel-api/complete-application/database/migrations/0001_01_01_000000_create_users_table.php (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- quickstart-php-laravel-api/complete-application/fusionauth.env (not merged: bluehawk_quickstartLaravelApi, fix/laravel-api-jwt-hardening)
- quickstart-php-laravel-web/complete-application/app/Models/User.php (merged: main | not merged: bluehawkCodeExamples, bluehawkQuickstartLaravelWeb, bluehawk_quickstartLaravelApi (and 8 more))
- quickstart-php-laravel-web/complete-application/app/Providers/AppServiceProvider.php (merged: main | not merged: bluehawkCodeExamples, bluehawkQuickstartLaravelWeb, bluehawk_quickstartLaravelApi (and 8 more))
- quickstart-php-laravel-web/complete-application/config/services.php (merged: main | not merged: bluehawkCodeExamples, bluehawkQuickstartLaravelWeb, bluehawk_quickstartLaravelApi (and 8 more))
- quickstart-rust-actix/complete-application/src/auth.rs (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 22 more))
- quickstart-rust-actix/complete-application/src/main.rs (merged: main | not merged: add-securing-rag-permify-blog, bluehawkCodeExamples, bluehawkLambdas (and 22 more))
- webauthn/base64url-to-buffer.js (merged: main | not merged: add-securing-rag-permify-blog, api-docs-improvements-2, bluehawkCodeExamples (and 33 more))
- webauthn/base64url-to-buffer.test.js (not merged: draft-codeSnippetPoc)
- webauthn/buffer-to-base64url.js (merged: main | not merged: add-securing-rag-permify-blog, api-docs-improvements-2, bluehawkCodeExamples (and 33 more))
- webauthn/buffer-to-base64url.test.js (not merged: draft-codeSnippetPoc)
- webhook-signing/signature-verify/verify-signature.test.js (not merged: draft-codeSnippetPoc)

---

## RemoteCode Files (82 files - excluding 12 already done)

These files use `<RemoteCode>` to fetch code from external URLs. Convert to use local snippets from `extractedcode/`.

- [x] cloud/operate/test.mdx
- [x] cloud/reference/disaster-recovery.mdx (removed unused import)
- [x] extend/code/password-hashes/custom-password-hashing.mdx
- [x] extend/code/password-hashes/writing-a-plugin.mdx
- [x] extend/events-and-webhooks/kafka/index.mdx
- [x] extend/events-and-webhooks/signing.mdx
- [x] extend/events-and-webhooks/webhook-event-log.mdx (removed unused import)
- [x] extend/events-and-webhooks/writing-a-webhook.mdx
- [x] extend/examples/5-minute-intro/_5-minute-configure-node-application.mdx
- [x] extend/examples/5-minute-intro/5-minute-docker.mdx
- [x] extend/examples/5-minute-intro/_5-minute-logout.mdx
- [x] extend/examples/5-minute-intro/_5-minute-store-user-object.mdx
- [x] extend/examples/controlling-access-mcp-server.mdx
- [x] extend/examples/device-limiting.mdx
- [x] extend/examples/modeling-organizations.mdx
- [x] extend/examples/multi-application-dashboard.mdx
- [x] extend/fine-grained-authorization.mdx
- [x] get-started/download-and-install/docker.mdx
- [x] get-started/download-and-install/kubernetes/index.mdx
- [x] get-started/quickstarts/app/quickstart-flutter-native.mdx
- [x] get-started/quickstarts/app/quickstart-java-android-native.mdx
- [x] get-started/quickstarts/app/quickstart-kotlin-android-native.mdx
- [x] get-started/quickstarts/app/quickstart-react-native.mdx
- [x] get-started/quickstarts/app/quickstart-swift-ios-native-appauth.mdx
- [x] get-started/quickstarts/app/quickstart-swift-ios-native.mdx
- [x] get-started/quickstarts/web/quickstart-javascript-nuxt-web.mdx
- [x] get-started/quickstarts/web/quickstart-java-springboot-web.mdx
- [x] get-started/quickstarts/web/quickstart-python-flask-web.mdx
- [x] get-started/start-here/step-2.mdx
- [x] get-started/start-here/step-3.mdx
- [x] get-started/start-here/step-4.mdx
- [x] get-started/start-here/step-5.mdx
- [x] get-started/start-here/step-6.mdx
- [x] get-started/start-here/step-7.mdx
- [x] get-started/use-cases/api-consents-platform.mdx
- [x] get-started/use-cases/machine-to-machine.mdx
- [x] lifecycle/authenticate-users/integrations/oidc/salesforce.mdx
- [x] lifecycle/authenticate-users/logout-session-management.mdx
- [x] lifecycle/authenticate-users/passwordless/webauthn-passkeys.mdx
- [x] lifecycle/authenticate-users/single-sign-on.mdx
- [x] lifecycle/manage-users/user-actions.mdx
- [x] lifecycle/migrate-users/framework-specific/passportjs.mdx
- [x] lifecycle/migrate-users/framework-specific/rails.mdx
- [x] lifecycle/migrate-users/provider-specific/azureadb2c.mdx
- [x] lifecycle/migrate-users/provider-specific/cognito.mdx
- [x] lifecycle/migrate-users/provider-specific/firebase.mdx
- [x] lifecycle/migrate-users/provider-specific/forgerock.mdx
- [x] lifecycle/migrate-users/provider-specific/keycloak.mdx
- [x] lifecycle/migrate-users/provider-specific/pingone.mdx
- [x] lifecycle/migrate-users/provider-specific/stytch.mdx
- [x] lifecycle/migrate-users/provider-specific/supabase.mdx
- [x] lifecycle/migrate-users/provider-specific/wordpress.mdx
- [x] lifecycle/migrate-users/scim/scim-sdk.mdx
- [x] lifecycle/register-users/anonymous-user.mdx
- [x] operate/deploy/terraform.mdx
- [x] operate/secure/key-master.mdx
- [x] _shared/email/_breached-password-html.mdx
- [x] _shared/email/_breached-password-txt.mdx
- [x] _shared/email/_change-password-html.mdx
- [x] _shared/email/_change-password-txt.mdx
- [x] _shared/email/_confirm-child-html.mdx
- [x] _shared/email/_confirm-child-txt.mdx
- [x] _shared/email/_coppa-email-plus-notice-html.mdx
- [x] _shared/email/_coppa-email-plus-notice-txt.mdx
- [x] _shared/email/_coppa-notice-html.mdx
- [x] _shared/email/_coppa-notice-txt.mdx
- [x] _shared/email/_email-verification-html.mdx
- [x] _shared/email/_email-verification-txt.mdx
- [x] _shared/email/_parent-registration-html.mdx
- [x] _shared/email/_parent-registration-txt.mdx
- [x] _shared/email/_registration-verification-html.mdx
- [x] _shared/email/_registration-verification-txt.mdx
- [x] _shared/email/_threat-detected-html.mdx
- [x] _shared/email/_threat-detected-txt.mdx
- [x] _shared/email/_two-factor-add-html.mdx
- [x] _shared/email/_two-factor-add-txt.mdx
- [x] _shared/email/_two-factor-login-html.mdx
- [x] _shared/email/_two-factor-login-txt.mdx
- [x] _shared/email/_two-factor-remove-html.mdx
- [x] _shared/email/_two-factor-remove-txt.mdx


---

## RemoteValue Files (3 files)

These files use `<RemoteValue>` to extract values from remote files. Convert to use `<LocalValue>`.

- [x] blog/identity-verification-before-registration.mdx
- [ ] get-started/quickstarts/api/quickstart-php-laravel-api.mdx (SKIP: done in other branches)
- [ ] get-started/quickstarts/web/quickstart-ruby-rails-web.mdx (SKIP: done in other branches)


---

## RemoteContent Files (9 files - excluding 2 already done)

These files use `<RemoteContent>` to fetch markdown from remote files. Convert to use `<LocalMarkdown>`.

- [x] get-started/download-and-install/development/mcp-server.mdx
- [x] get-started/quickstarts/app/quickstart-kotlin-android-native.mdx
- [x] get-started/quickstarts/app/quickstart-swift-ios-native.mdx
- [x] sdks/android-sdk.mdx
- [x] sdks/angular-sdk.mdx
- [x] sdks/react-sdk.mdx
- [x] sdks/swift-sdk.mdx
- [x] sdks/vue-sdk.mdx

## Blog Files with RemoteCode (24 files)

These blog files use `<RemoteCode>`. Convert to use `<LocalCode>`.

- [x] blog/android-end-to-end-testing.mdx
- [x] blog/android-sdk-beta.mdx
- [x] blog/anonymous-user.mdx
- [x] blog/forgerock-password-storage.mdx
- [x] blog/how-to-design-oauth-scopes.mdx
- [x] blog/identity-verification-before-registration.mdx
- [x] blog/swift-sdk-beta.mdx
- [x] blog/2023-hacktoberfest.mdx (import only, no usage)
- [x] blog/2024-hacktoberfest.mdx (import only, no usage)
- [x] blog/dotnet-templates.mdx (import only, no usage)
- [x] blog/6-indicators-doing-mocking-wrong.mdx
- [x] blog/backend-for-frontend.mdx
- [x] blog/custom-scopes-in-third-party-applications.mdx
- [x] blog/get-more-value-out-of-fusionauth.mdx
- [x] blog/javascript-sdks.mdx
- [x] blog/modeling-family-and-consents.mdx
- [x] blog/nextjs-single-sign-on.mdx
- [x] blog/permify-bulk-permissions-check.mdx
- [x] blog/react-example-application.mdx
- [x] blog/remix-demo.mdx
- [x] blog/securing-react-native-with-oauth.mdx
- [x] blog/spring-and-fusionauth.mdx
- [x] blog/to-mock-or-not-mock-auth.mdx
- [x] blog/using-identity-provider-links.mdx

## Docs Files with RemoteCode (1 file)

- [x] docs/get-started/download-and-install/reference/docker-configuration.mdx


---

## Old-Style Tag Files (63 files with referenced tags)

These files contain `tag::`/`end::` markers that are actively used by documentation. Convert to bluehawk-style `:snippet-start:`/`:snippet-end:` markers.

- [x] android-sdk/README.md
- [x] contrib/Password Hashing Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleFirebaseScryptPasswordEncryptor.java
- [x] contrib/Password Hashing Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleStytchScryptPasswordEncryptor.java
- [x] example-5-minute-guide/routes/index.js
- [x] example-5-minute-guide/views/index.pug
- [x] example-anonymous-user/complete-application/server.py
- [x] example-api-consents-platform/changebank-apis/app.js
- [x] example-api-consents-platform/changebank-apis/routes/index.js
- [x] example-api-consents-platform/changebank-apis/services/hasScope.js
- [x] example-api-consents-platform/create-application/create-application.js
- [x] example-api-consents-platform/moneyscope-application/src/index.ts
- [x] example-device-limit-friendly/complete-application/src/index.ts
- [x] example-device-limit-simple/complete-application/src/index.ts
- [x] example-fine-grained-authorization/app/src/index.ts
- [x] example-fine-grained-authorization/docker-compose.yml
- [x] example-fine-grained-authorization/permify-setup/src/loaddata.ts
- [x] example-full-user-search/client-side-password-rules/README.md
- [x] example-get-started/src/index.mts
- [x] example-get-started/src/sdk.ts
- [x] example-get-started/tests/example.spec.ts
- [x] example-javascript-webhooks/simple/app.js
- [x] example-machine-to-machine/apis/app.js
- [x] example-machine-to-machine/request-api/request-news.js
- [x] example-modeling-organizations/complete-application/app.js
- [x] example-modeling-organizations/complete-application/middleware/checkGrantPermissions.js
- [x] example-modeling-organizations/complete-application/routes/admin.js
- [x] example-modeling-organizations/complete-application/routes/billing.js
- [x] example-modeling-organizations/complete-application/routes/index.js
- [x] example-modeling-organizations/complete-application/routes/users.js
- [x] example-node-centralized-sessions/changebankforum/src/index.ts
- [x] example-node-centralized-sessions/changebank/src/index.ts
- [x] example-node-sso/pied-piper/routes/index.js
- [x] example-protected-mcp-server/protected-local-mcp/mcp-server/server.py
- [x] example-protected-mcp-server/protected-local-mcp/setup/setup_clients.py
- [x] example-protected-mcp-server/unprotected-local-mcp/mcp-server/server.py
- [x] example-protected-mcp-server/unprotected-local-mcp/setup/setup_clients.py
- [x] example-scim-integration/src/main/java/io/fusionauth/example/scim/ScimExample.java
- [x] example-terraform/examples/create/main.tf
- [x] example-terraform/examples/data-source/main.tf
- [x] example-terraform/examples/import/main.tf
- [x] example-user-actions-guide/app.js
- [x] example-user-actions-guide/routes/index.js
- [x] example-user-actions-guide/views/index.pug
- [x] homebrew-fusionauth/README.md
- [x] javascript-sdk/packages/sdk-angular/docs/README.md
- [x] javascript-sdk/packages/sdk-angular/README.md
- [x] javascript-sdk/packages/sdk-react/docs/README.md
- [x] javascript-sdk/packages/sdk-react/README.md
- [x] javascript-sdk/packages/sdk-vue/docs/README.md
- [x] javascript-sdk/packages/sdk-vue/generated/README.adoc
- [x] javascript-sdk/packages/sdk-vue/README.md
- [x] mcp-api/packages/mcp-api/README.md
- [x] mcp-api/README.md
- [x] php-client/README.md
- [x] python-client/README.md
- [x] quickstart-flutter-native/complete-application/android/app/build.gradle
- [x] quickstart-flutter-native/complete-application/pubspec.yaml
- [x] quickstart-kotlin-android-native/README.md
- [x] quickstart-python-flask-web/complete-application/server.py
- [x] quickstart-swift-ios-native/README.md
- [x] ruby-client/README.md
- [x] swift-sdk/README.md
- [x] terraform-provider/docs/guides/handling_default_resources.md

**Progress: 63/63**

---

## Unreferenced Tag Files (9 files)

These files contain only tags that are NOT referenced by any documentation. All tags were converted to bluehawk format (snippet-start/snippet-end) for consistency, even though they're not currently used.

- [x] android-sdk/CONTRIBUTING.md (tag: forDocSiteContributing) - converted to bluehawk
- [x] example-get-started/templates/account.html (tag: logout) - converted to bluehawk
- [x] example-get-started/templates/home.html (tag: login) - converted to bluehawk
- [x] example-kickstart/identity-verification/lambdas/fideo.js (tag: ForgerockPasswordHash) - converted to bluehawk
- [x] example-modeling-organizations/complete-application/middleware/loadGrants.js (tag: loadGrantsMW) - converted to bluehawk
- [x] homebrew-fusionauth/CONTRIBUTING.md (tag: forDocSiteContributing) - converted to bluehawk
- [x] import-scripts/forgerock/import.rb (tag: security) - converted to bluehawk
- [x] quickstart-kotlin-android-native/TESTING.md (tag: forDocSiteE2ETest) - converted to bluehawk
- [x] swift-sdk/CONTRIBUTING.md (tag: forDocSiteContributing) - converted to bluehawk

**Progress: 9/9**


---

## Notes

### Component Mapping
- `<RemoteCode url="...">` → Use bluehawk snippets with `:snippet-start:` markers
- `<RemoteValue url="..." selector="...">` → `<LocalValue path="..." selector="...">`
- `<RemoteContent url="...">` → `<LocalMarkdown src="...">`

### Path Mapping
- Remote URLs like `https://raw.githubusercontent.com/FusionAuth/fusionauth-example-xxx/main/...` → Local paths like `extractedcode/example-xxx/...`
- For full file references: `extractedcode/<repo-name>/<file-path>`
- For snippet references: Use `:snippet-start: tagName` in source files

### Tag Conversion
- Old: `tag::tagName[]` / `end::tagName[]`
- New: `:snippet-start: tagName` / `:snippet-end:`

### Email Template Files (2026-09-16)
- **Converted**: All 28 email template MDX files from `FreemarkerTemplate` to `LocalEmailCode`
- **New component**: `astro/src/components/LocalEmailCode.astro` - reads from `src/content/docs/_shared/email/`, defaults to `lang="ftl"`
- **Files affected**: `_shared/email/_*.mdx` (26 files), `_shared/_passwordless-login-templates.mdx`, `_shared/_set-password-templates.mdx`
- **Location unchanged**: `astro/src/content/docs/_shared/email/*.ftl` - no file moves needed
- **Workflow unchanged**: `.github/workflows/update-email-templates.yml` continues to work as-is
- **Simplified**: Removed redundant `lang` attributes from all LocalEmailCode usages since all files are `.ftl`


## Cleanup Actions (2026-09-15)

### Deleted: astro/extractedcode/webauthn/
- **Reason**: Duplicate folder from James Whitford's POC work (commit a587c5dc6)
- **History**: Created with Bluehawk tags but never used by any MDX files
- **Replacement**: astro/extractedcode/example-javascript-webauthn/ (added by Richard in commit 707313978)
- **Impact**: No MDX files referenced this folder, so deletion is safe

### Preserved: astro/src/generated-code-snippets/webauthn/
- **Reason**: Auto-generated files should not be manually deleted
- **Note**: These will be regenerated when build runs

### Preserved: astro/src/content/json/webauthn/
- **Reason**: JSON files referenced by MDX files (different from extractedcode)
- **References**: Used by webauthn API documentation for JSON examples

## Repo Imports (2026-09-16)

Imported 18 repos into `astro/extractedcode/` for blog file conversions:

1. example-hostedbackend
2. example-ruby-on-rails-custom-scopes
3. example-dotnet-windowsform-api
4. example-node-deeplink
5. example-family-api
6. example-firebase-mock-testing-vs-emulation
7. example-nextjs-single-sign-on
8. example-permify-bulk-check
9. example-react-fusiondesk
10. example-remix
11. example-react-native-0-71
12. example-java-spring
13. example-to-mock-or-not-mock
14. example-using-links-fastify
15. quickstart-javascript-angular-web
16. quickstart-javascript-react-web
17. quickstart-javascript-vue-web
18. example-mock-testing-vs-dev-server

All repos:
- Cloned from main branch
- .git directories removed
- repositoryUrl.txt added
- tests/test.sh created
- README.md updated with warning after main heading
- Added to repo-import-mapping.md (count updated to 57 IMPORTED repos)

