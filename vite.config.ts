/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

/**
 * 課題の API のオリジン。中継先を書くのはここだけにする。
 * API は CORS を許可していないので、ブラウザから別のオリジンとしては読めない。
 * そこで /api を同じオリジン (開発サーバ) で受け、サーバどうしでここへ中継する。
 */
const API_ORIGIN =
  "https://frontend-assessment-630736206587.asia-northeast1.run.app";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      /*
       * API 側も /api/facilitators というパスなので、パスは変えずにそのまま送る。
       * changeOrigin: true にすると、送る要求の宛先名 (Host ヘッダ) を API のホスト名に直す。
       * 付けないと、宛先名が localhost:5173 のまま API に届く。
       * vite preview にも、この中継がそのまま使われる。
       */
      "/api": { target: API_ORIGIN, changeOrigin: true },
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/testing/setup.ts"],
  },
});
