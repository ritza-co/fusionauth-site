import { readFileSync, writeFileSync } from 'node:fs';

const runnerPath = new URL('../node_modules/astro-better-generate-screenshots/scripts/take-screenshots.mjs', import.meta.url);
let source = readFileSync(runnerPath, 'utf8');

if (source.includes('config.resetContextAfterScreenshots?.includes(spec.name)')) {
  const oldCallback = 'await config.afterBrowserContextReset?.(nextContext);';
  if (source.includes(oldCallback)) {
    source = source.replace(oldCallback, 'await config.afterBrowserContextReset?.(nextContext, spec);');
    writeFileSync(runnerPath, source);
  }
  process.exit(0);
}

const contextSetup = `  const { browser, context } = await createBrowserContext({
    browser: config.browser,
    width: config.window.width,
    height: config.window.height,
    colorScheme: config.colorScheme,
    wsEndpoint: container?.wsEndpoint,
  });`;
const contextSetupPatched = `  const { browser, context: initialContext } = await createBrowserContext({
    browser: config.browser,
    width: config.window.width,
    height: config.window.height,
    colorScheme: config.colorScheme,
    wsEndpoint: container?.wsEndpoint,
  });
  let context = initialContext;`;

const captureComplete = `      writeFileSync(outputPath, finalBuffer);
      process.stdout.write('done\\n');`;
const captureCompletePatched = `      writeFileSync(outputPath, finalBuffer);
      if (config.resetContextAfterScreenshots?.includes(spec.name)) {
        const nextContext = await browser.newContext({
          viewport: { width: config.window.width, height: config.window.height },
          colorScheme: config.colorScheme ?? 'light',
          deviceScaleFactor: 2,
        });
        try {
          await config.afterBrowserContextReset?.(nextContext, spec);
        } catch (error) {
          await nextContext.close().catch(() => {});
          throw new Error(\`browser context reset after \${spec.name} failed: \${error.message}\`, { cause: error });
        }
        await context.close();
        context = nextContext;
        console.log(\`[screenshots] reset browser context after \${spec.name}\`);
      }
      process.stdout.write('done\\n');`;

if (!source.includes(contextSetup) || !source.includes(captureComplete)) {
  throw new Error(`Cannot apply the screenshot runner context-reset patch to ${runnerPath.pathname}; inspect the installed CLI version.`);
}
source = source.replace(contextSetup, contextSetupPatched).replace(captureComplete, captureCompletePatched);
writeFileSync(runnerPath, source);
console.log('[screenshots] enabled configured browser-context resets');
