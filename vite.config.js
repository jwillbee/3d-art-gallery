import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/3d-art-gallery/", // Important for relative paths in Vercel
  build: {
    outDir: "dist",
    emptyOutDir: true, // Ensures a clean build
  },
});
