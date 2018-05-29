require("babel-register")({
  "presets": [
    "env"
  ],
  "plugins": [
    "transform-class-properties"
  ]
});

require("./app");