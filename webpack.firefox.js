const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

module.exports = merge(common, {
  entry: {
    background: path.join(__dirname, "src/bootstrap/firefox/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/firefox/js/"),
  },
  plugins: [
    new MergeJsonWebpackPlugin({
      debug: true,
      files: [
        "src/manifest/manifest.common.json",
        "src/manifest/manifest.firefox.json",
      ],
      output: {
        fileName: "../manifest.json",
      },
    }),
  ],
});
