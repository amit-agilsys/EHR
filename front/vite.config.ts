import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  base: "/",
  resolve: {
    alias: {
      components: path.resolve(__dirname, "./src/components"),
      pages: path.resolve(__dirname, "./src/pages"),
      styles: path.resolve(__dirname, "./src/styles"),
      dataTypes: path.resolve(__dirname, "./src/types"),
      slices: path.resolve(__dirname, "./src/stores/slices"),
      store: path.resolve(__dirname, "./src/stores"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      helpers: path.resolve(__dirname, "./src/helpers"),
      apiTypes: path.resolve(__dirname, "./src/hooks/types"),
      constants: path.resolve(__dirname, "./src/constants"),
      api: path.resolve(__dirname, "./src/hooks/api"),
      utils: path.resolve(__dirname, "./src/utils"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5190,
  },
});
