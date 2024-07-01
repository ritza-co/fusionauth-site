import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

// Global diagram config
const config = {
  boxMargin: 30,
  messageMargin: 5000,
  mirrorActors: true,
  noteMargin: 5,
  wrap: true
};

export default async function renderDiagram({ code, id, nostyle=true }) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent('<!DOCTYPE html><html><head></head><body></body></html>');

  const content = await fs.readFile(
    path.join(process.cwd(), 'node_modules/mermaid/dist/mermaid.js'),
    'utf8',
  );

  page.on('console', msg => console.log('Mermaid render error in render-diagram.js:', msg.text()));

  await page.addScriptTag({ content });

  const result = await page.evaluate(
    async (configB, codeB, id) => {
      // FIXME: `window.mermaid` global browser stubbing
      window.mermaid.initialize(configB);

      try {
        // Render the mermaid diagram
        const svgCode = await window.mermaid.mermaidAPI.render(id, codeB);
        return Promise.resolve({ status: 'success', svgCode: svgCode.svg });
      } catch (error) {
        console.log(error);
        console.log(error.message);
        return Promise.reject({ status: 'error', error, message: error.message });
      }
    },
    config,
    code,
    id
  );

  await browser.close();

  if (result.status === 'success' && typeof result.svgCode === 'string') {
    if (nostyle) {
      result.svgCode = result.svgCode.replace(/<style>.+<\/style>/i, '');
    }
    return result.svgCode;
  }

  return false;
}
