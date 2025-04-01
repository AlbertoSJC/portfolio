/* eslint-disable no-console */
import { createPinia } from 'pinia';
import type { App } from 'vue';

const pinia = createPinia();

export default (app: App) => {
  app.use(pinia);

  app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err);
    console.log('Vue instance:', instance);
    console.log('Error info:', info);
  };
};
