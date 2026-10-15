import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Relative base: works at https://<user>.github.io/<repo>/ and locally.
export default defineConfig({
  base: "./",
  plugins: [preact()],
  worker: { format: "es" },
  server: { fs: { allow: [".."] } },   // the engine and data live next to site/
});
