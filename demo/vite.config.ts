import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@particles/core": resolve(__dirname, "../src/core/index.ts"),
      "@particles/render": resolve(__dirname, "../src/render/index.ts"),
    },
  },
});
