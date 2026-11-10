import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'app',
          environment: 'node',
          include: ['tests/unit/app/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['tests/unit/ui/**/*.test.tsx'],
          setupFiles: ['tests/unit/ui/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['tests/unit/scripts/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**', 'scripts/**'],
      exclude: ['**/*.d.ts'],
    },
  },
});
