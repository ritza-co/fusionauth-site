import {defineConfig} from 'astro/config';
// fixme re-enable this when astro gets their repo fixed
//import compress from "astro-compress";
import compress from "@otterlord/astro-compress";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import indexPages from "astro-index-pages/index.js";
import { rehypeTasklistEnhancer } from './src/plugins/rehype-tasklist-enhancer';

export default defineConfig({
  build: {
    format: 'file'
  },
  integrations: [
    compress(),
    mdx(),
    sitemap(),
    indexPages(),
    tailwind({
      config: {
        applyBaseStyles: false
      }
    })
  ],
  markdown: {
    rehypePlugins: [
        // Tweak GFM task list syntax
        rehypeTasklistEnhancer()
    ]
  },
  site: 'https://fusionauth.io/'
});
