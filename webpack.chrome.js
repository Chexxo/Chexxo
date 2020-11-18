const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  entry: {
    background: path.join(__dirname, "src/background/bootstrap/chrome/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/chrome/js/"),
  },
});