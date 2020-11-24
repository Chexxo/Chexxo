const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

module.exports = merge(common, {
  entry: {
    background: path.join(__dirname, "src/bootstrap/chromium/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/chromium/js/"),
  },
  plugins: [
    new MergeJsonWebpackPlugin({
      debug: true,
      files: [
        "src/manifest/manifest.common.json",
        "src/manifest/manifest.chromium.json",
      ],
      output: {
        fileName: "../manifest.json",
      },
    }),
  ],
});
