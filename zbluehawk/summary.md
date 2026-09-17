This branch, draft_bluehawkAllRepos, converts every use of `RemoteCode`, `RemoteValue`, and `RemoteContent` to `LocalCode`, `LocalValue`, `LocalEmailCode`, or `LocalMarkdown`. Source code tags are converted to Bluehawk (`snippet` instead of `tag::`). The only exception is articles and code changed in branches not yet merged (like some quickstarts done by Ritza), which have not been touched.

## Summary of work done

- ~120 MDX files changed - docs, blog, and emails
- 63 source files updated to Bluehawk tags
- One source file had nested tags, which Bluehawk can't handle. They were deleted and the mdx file was update slightly: `astro/extractedcode/example-device-limit-simple/complete-application/src/index.ts` used by [astro/src/content/docs/extend/examples/device-limiting.mdx](http://localhost:3001/docs/extend/examples/device-limiting).
- [Emails](http://localhost:3001/docs/customize/email-and-messages/email-templates-replacement-variables) now use LocalEmailCode instead of RemoteCode or LocalCode. The emails are *pulled* in from FusionAuth and thus don't belong in the `extractedcode` folder, which is used to *push* repositories out. As LocalCode is now in an external repository, I could not update it to handle both situations.

## To do

- This branch was created from `main` on Monday the 14th. Changes after this date will need to be merged in carefully before this branch can be merged back to main.
- Snippets will not generate until Nathan accepts pull request to remove symlinks, https://github.com/nathan-contino/astro-better-code-blocks/pull/1 (or you make the change manually locally yourself when building the project and don't update npm again to overwrite it)
- The Remote components have not been deleted yet. Once merged to main and finalized, they can be.
-