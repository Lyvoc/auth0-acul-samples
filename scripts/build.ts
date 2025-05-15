import { build } from "vite";
async function buildScreens() {
  try {
    await build();
    console.log("Build completed successfully");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}
buildScreens();
