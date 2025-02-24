import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid',
  base: '/',
  trailingSlash: 'ignore',
  adapter: node({
    mode: 'standalone',
  }),
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
