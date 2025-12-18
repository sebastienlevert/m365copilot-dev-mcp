import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'build/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ]
    },
    include: ['test/**/*.test.ts'],
    exclude: ['node_modules', 'build'],
    testTimeout: 10000
  }
});
