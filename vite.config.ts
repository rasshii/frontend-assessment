/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    environment: 'jsdom',
    // e2e/ の *.spec.ts は Playwright が流すので、Vitest の対象から外す
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/testing/setup.ts'],
  },
})
