import { defineConfig } from 'vitest/config';

// VITE_BASE: pot, na kateri je frontend objavljen (npr. /RIRS_Projekt/ na GitHub Pages); privzeto koren.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
