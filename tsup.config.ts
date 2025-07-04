import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "!src/test.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
});
