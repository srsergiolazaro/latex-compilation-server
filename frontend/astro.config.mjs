// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/compile': {
          target: 'https://latex.taptapp.xyz',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/compile/, '/compile')
        },
        '/compile-status': {
          target: 'https://latex.taptapp.xyz',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/compile-status/, '/compile-status')
        }
      }
    }
  },

  adapter: node({
    mode: 'standalone'
  })
});