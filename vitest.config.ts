import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src"), "@shared": path.resolve(import.meta.dirname, "shared") } },
  test: {
    environment: "node",
    fileParallelism: false,
    include: ["client/src/**/*.test.{ts,tsx}", "shared/**/*.test.ts", "server/**/*.test.ts"],
    coverage: { enabled: false },
  },
});
