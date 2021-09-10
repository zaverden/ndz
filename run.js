require("./build.js");

require("nodemon")({
  signal: "SIGTERM",
  script: "dist/ndz.js",
  watch: ["dist"],
  nodeArgs: ["--require", "source-map-support/register"],
});
