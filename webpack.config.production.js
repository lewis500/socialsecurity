const { resolve, join } = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.js"
  },
  output: {
    filename: "js/[name].js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: module =>
        module.context && module.context.indexOf("node_modules") !== -1
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest"
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src", "index.html")
    }),
    new ExtractTextPlugin("style.css"),
    new webpack.optimize.UglifyJsPlugin()
  ],
  // devtool: "#source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        include: resolve(__dirname, "src")
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            "css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]",
            "postcss-loader",
            "sass-loader"
          ]
        })
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
      src: resolve(__dirname, "src")
    }
  }
};
