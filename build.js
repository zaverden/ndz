const [, , ...args] = process.argv;
const argsSet = new Set(args);
const watch = !argsSet.has("--no-watch");

function onRebuild() {
  console.log(new Date(), "Rebuild completed.");
}

require("esbuild")
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "dist/ndz.js",
    platform: "node",
    target: "node14",
    watch: watch ? { onRebuild } : false,
  })
  .catch(() => process.exit(1));
