module.exports = {
  inputFiles: ["./src/"],
  mode: "file",
  module: "none",
  out: "./docs/",
  plugin: "typedoc-plugin-no-inherit",
  tsconfig: "./tsconfig.json",
};
