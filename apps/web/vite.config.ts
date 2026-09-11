import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  worker: {
    format: "es",
  },
  test: {
    exclude: ["tests/**", "node_modules/**"],
  },
});
