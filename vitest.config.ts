import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    alias: {
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./components"),
      "@": path.resolve(__dirname, "."),
    },
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./components"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
