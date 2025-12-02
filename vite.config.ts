// vite.config.ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Important for GitHub Pages (matches repo name)
  base: "/virtual_mechanic_AI/",

  server: {
    port: 3000,
    host: "0.0.0.0",
  },

  plugins: [react()],

  define: {
    // Prevent accidental leaking of process.env (fix for your earlier mistake)
    "process.env": {},
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
