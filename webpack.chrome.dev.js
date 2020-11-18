const { merge } = require("webpack-merge");
const chrome = require("./webpack.chrome");

module.exports = merge(chrome, {
  mode: "development",
  devtool: "inline-source-map",
});
