const { merge } = require("webpack-merge");
const firefox = require("./webpack.firefox");

module.exports = merge(firefox, {
  mode: "production",
  optimization: {
    minimize: false,
  },
});
