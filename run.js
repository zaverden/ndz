require("./build.js");

require("nodemon")({
  signal: "SIGTERM",
  script: "dist/ndz.js",
  // nodeArgs: "--enable-source-maps",
});
