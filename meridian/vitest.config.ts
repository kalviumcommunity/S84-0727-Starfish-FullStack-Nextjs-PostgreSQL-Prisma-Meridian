import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: false,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/server/**/*.ts"],
      exclude: ["src/server/db.ts", "src/server/env.ts"],
    },
  },
});
