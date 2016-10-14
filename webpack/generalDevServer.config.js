'use strict'

let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')


let vendorModules = /(node_modules|bower_components)/

let option = process.env.OPTION
let path = process.env.OPTION_PATH

module.exports = {
  target: "web",
  entry: {
    app: "./" + path + "/" + option + "/index.ts",
  },

  output: {
    path: "./" + path + "/" + option,
    filename: "app.js",
    pathinfo: true,
    publicPath: "",
  },

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },

  module: {
    preLoaders: [
    ],
    loaders: [
      { test: /\.ts/, loader: 'ts-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
      { test: /\.jpg$/, loader: "url-loader?mimetype=image/jpg" },
      { test: /\.bmp$/, loader: "url-loader?mimetype=image/bmp" },
      { test: /\.png$/, loader: "url-loader?mimetype=image/png" }
    ],
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin("init.js"),
    new HtmlWebpackPlugin({
      title: path,
      minify: process.env.NODE_ENV === 'production' ? {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        conservativeCollapse: false,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        preventAttributesEscaping: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      } : false,
      template: './' + path + '/' + option + '/index.html',
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  debug: true,
  devtool: "source-map",
  profile: false,

  devServer: {
    contentBase: "./public",
    port: 3000,

    hot: true,
    inline: true,
    historyApiFallback: true,

    colors: true,
    stats: 'normal',
  },
}
