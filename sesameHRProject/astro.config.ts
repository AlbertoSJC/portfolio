import node from '@astrojs/node';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  base: '/',
  trailingSlash: 'ignore',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    vue({
      appEntrypoint: '/src/app.ts',
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
  ],
});
