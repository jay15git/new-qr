import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "@new-qr/qr-scene-codegen": fileURLToPath(
        new URL("./packages/qr-scene-codegen/src/index.ts", import.meta.url),
      ),
      "@new-qr/qr-scene-shaders": fileURLToPath(
        new URL("./packages/qr-scene-shaders/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    exclude: [
      ".portable-compose-editor/**",
      ".external/**",
      "node_modules/**",
      ".next/**",
      "packages/**/node_modules/**",
      "**/*.spec.js",
    ],
    environment: "node",
  },
});
