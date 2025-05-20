import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Screen definitions
const screens = ["login-id", "login-password"];

// Generate input object for all screens
const input = Object.fromEntries(
  screens.map((name) => [name, resolve(__dirname, `src/main.tsx`)])
);

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input,
      output: {
        dir: "dist",
        entryFileNames: "[name]/index.js",
        assetFileNames: "[name]/index.css",
        chunkFileNames: "[name]/[name].js",
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-auth0": ["@auth0/auth0-acul-js"],
        },
      },
    },
    sourcemap: true,
    minify: "terser",
    emptyOutDir: true,
  },
});
