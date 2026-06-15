import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 5173,
    // Proxy /api to the backend in dev so the form works locally.
    // Set VITE_API_TARGET to a deployed API base if you want to test against real backend.
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
