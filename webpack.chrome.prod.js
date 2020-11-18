const { merge } = require("webpack-merge");
const chrome = require("./webpack.chrome");

module.exports = merge(chrome, {
  mode: "production",
  optimization: {
    minimize: false,
  },
});
