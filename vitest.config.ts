import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [
      "./tests/setup/next-mocks.tsx",
      "./tests/setup/browser-mocks.ts",
      "./vitest.setup.ts",
    ],
    include: ["**/*.test.{ts,tsx}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "context/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "scripts/**/*.js",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/types/**",
        "**/*.config.{ts,mjs}",
        "next-env.d.ts",
        "capacitor.config.ts",
        "**/components/skeletons/index.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
