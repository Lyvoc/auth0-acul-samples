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
        // One folder per screen
        dir: "dist",
        entryFileNames: "[name]/index.js",
        assetFileNames: "[name]/index.css",
        chunkFileNames: (chunkInfo) => {
          // Force known chunk names into screen folders
          if (chunkInfo.name === "vendor-react")
            return "[name]/vendor-react.js";
          if (chunkInfo.name === "vendor-auth0")
            return "[name]/vendor-auth0.js";
          return "[name]/[name].js"; // fallback
        },
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
