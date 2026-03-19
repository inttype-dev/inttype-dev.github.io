// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { visit } from 'unist-util-visit';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function rehypeLazyImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://inttype-dev.github.io',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeLazyImages],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
});