const { merge } = require("webpack-merge");
const chromium = require("./webpack.chromium");

module.exports = merge(chromium, {
  mode: "production",
  optimization: {
    minimize: false,
  },
});
