const { merge } = require("webpack-merge");
const chromium = require("./webpack.chromium");

module.exports = merge(chromium, {
  mode: "development",
  devtool: "inline-source-map",
});
