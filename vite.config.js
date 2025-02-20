import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "", // Change this to "" (empty) or remove it entirely
  build: {
    outDir: "dist"
  }
});


