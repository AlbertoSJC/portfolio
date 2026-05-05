import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Recharts uses ResizeObserver in the ResponsiveContainer component.
// JSDOM does not provide ResizeObserver, so we mock it for the test environment.
;(global as Record<string, unknown>).ResizeObserver = class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};

afterEach(() => {
  cleanup();
});