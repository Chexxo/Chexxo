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
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
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
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
};
