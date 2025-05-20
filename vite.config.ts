import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Screen definitions
const screens = ["login-id", "login-password"];

// Generate input object for all screens
const input = Object.fromEntries(
  screens.map((name) => [name, resolve(__dirname, `src/main.tsx`)])
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input,
      output: {
        // Ensure each screen gets its own directory
        dir: "dist",
        entryFileNames: "[name]/index.js",
        assetFileNames: "[name]/[name][extname]",
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-auth0": ["@auth0/auth0-acul-js"],
        },
      },
    },
    // Generate sourcemaps for production debugging
    sourcemap: true,
    // Minify output
    minify: "terser",
    emptyOutDir: true,
  },
});
