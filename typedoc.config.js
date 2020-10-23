module.exports = {
  inputFiles: ["./src/"],
  mode: "modules",
  out: "./docs/",
  plugin: ["typedoc-plugin-no-inherit", "typedoc-plugin-external-module-name"],
  tsconfig: "./tsconfig.json",
};
