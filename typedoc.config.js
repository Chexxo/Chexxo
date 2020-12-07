module.exports = {
  inputFiles: ["./src/"],
  exclude: [
    "./src/**/__tests__",
    "./src/**/__mocks__",
    "**/*.test.ts",
    "./src/bootstrap/*",
  ],
  mode: "modules",
  out: "./docs/",
  plugin: ["typedoc-plugin-no-inherit", "typedoc-plugin-external-module-name"],
  tsconfig: "./tsconfig.json",
};
