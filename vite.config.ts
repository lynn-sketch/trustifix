import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production builds deploy to https://lynn-sketch.github.io/trustifix/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/trustifix/" : "/",
}));
