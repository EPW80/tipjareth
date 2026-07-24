import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    env: { NODE_ENV: "test" },
    hookTimeout: 60_000,
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
