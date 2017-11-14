const { resolve, join } = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.js"
  },
  output: {
    filename: "js/[name].[chunkhash].js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: module =>
        module.context && module.context.indexOf("node_modules") !== -1
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest"
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src", "index.html")
    })
  ],
  devtool: "#eval-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        include: resolve(__dirname, "src")
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 80000
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".scss"],
    alias: {
      components: resolve(__dirname, "src/components"),
      constants: resolve(__dirname, "src/constants"),
      types: resolve(__dirname, "src/types"),
      src: resolve(__dirname, "src")
    }
  },
  devServer: {
    compress: true,
    port: 3000
  }
};
