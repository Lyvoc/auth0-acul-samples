import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Screen definitions
const screens = [{ name: "login-id" }, { name: "login-password" }];

const input = Object.fromEntries(
  screens.map((screen) => [
    screen.name,
    resolve(__dirname, `src/screens/${screen.name}/index.tsx`),
  ])
);

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input,
      output: {
        dir: "dist",
        entryFileNames: "[name]/index.js",
        assetFileNames: "[name]/[name][extname]",
        chunkFileNames: "[name]/chunks/[name]-[hash].js",
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
