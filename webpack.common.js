const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    popup: path.join(__dirname, "src/popup/index.tsx"),
    background: path.join(__dirname, "src/background/index.ts"),
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(ttf|woff(2)?|eot|svg|png)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "../assets/",
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.join(__dirname, "dist/js/"),
    filename: "[name].js",
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "../styles/[name].css" }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/static/", to: "../" }],
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
};
