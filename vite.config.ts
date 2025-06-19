import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Minits",
      fileName: "minits",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [],
      output: {
        exports: "named",
      },
    },
    minify: true,
    sourcemap: true,
  },
});
