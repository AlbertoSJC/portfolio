/* eslint-disable no-console */
import { createPinia } from 'pinia';
import { setupMockAdapter } from 'src/services/mockSetup';
import type { App } from 'vue';

const pinia = createPinia();

setupMockAdapter();

export default (app: App) => {
  app.use(pinia);

  app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err);
    console.log('Vue instance:', instance);
    console.log('Error info:', info);
  };
};
