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
        manualChunks(id) {
          if (id.includes("node_modules/react")) return "vendor-react";
          if (id.includes("node_modules/@auth0")) return "vendor-auth0";
        },
      },
    },
    sourcemap: true,
    minify: "terser",
    emptyOutDir: true,
  },
});
