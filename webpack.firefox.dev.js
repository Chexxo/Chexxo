const { merge } = require("webpack-merge");
const firefox = require("./webpack.firefox");

module.exports = merge(firefox, {
  mode: "development",
  devtool: "inline-source-map",
});
