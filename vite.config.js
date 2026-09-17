import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 5173),
    strictPort: Boolean(process.env.PORT),
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 5173),
    strictPort: Boolean(process.env.PORT),
    allowedHosts: true,
  },
});
