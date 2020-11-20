const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  entry: {
    background: path.join(__dirname, "src/bootstrap/chromium/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/chromium/js/"),
  },
});