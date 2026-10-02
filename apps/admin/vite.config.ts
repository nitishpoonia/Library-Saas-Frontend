import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  // One internal user on a desktop: ~160 KB gzipped is fine, no code-splitting needed yet.
  build: { chunkSizeWarningLimit: 600 },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
