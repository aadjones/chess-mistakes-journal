import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    // Note: Database tests currently require sequential execution
    // due to shared PrismaClient instances and beforeEach table recreation.
    // For improved parallel testing, see __tests__/helpers/test-db.ts
    fileParallelism: false,
    sequence: {
      hooks: 'stack',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
