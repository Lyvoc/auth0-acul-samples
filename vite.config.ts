import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Screen definitions
const screens = ["login-id", "login-password","signup-id","mfa-phone-enrollment"];

// Generate input object for all screens
const input = Object.fromEntries(
  screens.map((screen) => [
    screen,
    resolve(__dirname, `src/screens/${screen}/main.tsx`),
  ])
);

export default defineConfig({
  base: process.env.VITE_PUBLIC_CDN?.startsWith("/")
    ? process.env.VITE_PUBLIC_CDN
    : "/" + (process.env.VITE_PUBLIC_CDN ?? ""),
  plugins: [react()],
  build: {
    rollupOptions: {
      input,
      output: {
        dir: "dist",
        entryFileNames: "[name]/index.js",
        assetFileNames: "[name]/index.css",
        chunkFileNames: (chunkInfo) => {
          if (
            chunkInfo.name === "vendor-react" ||
            chunkInfo.name === "vendor-auth0"
          ) {
            return "[name].js"; // emit to root of dist/
          }
          return "[name]/[name].js"; // emit entry chunks to screen folder
        },
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
