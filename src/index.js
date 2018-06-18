require("babel-polyfill");
require("babel-register")({
  "presets": [
    "env"
  ],
  "plugins": [
    "transform-async-to-generator",
    "transform-class-properties"
  ]
});

require("./app");