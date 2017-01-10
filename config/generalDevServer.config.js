'use strict'

let webpack = require('webpack')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin
let path = require('path')

let vendorModules = /(node_modules|bower_components)/

let option = process.env.OPTION
let pathName = process.env.OPTION_PATH

module.exports = {
  entry: './' + pathName + '/' + option + '/index.ts',

  output: {
    path: __dirname + '/' + pathName + ''/ + option,
    filename: '[name].js',
    publicPath: '',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        exclude: __dirname + '/node_modules',
        loader: 'awesome-typescript-loader',
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
      { test: /\.jpg$/, loader: 'url-loader?mimetype=image/jpg' },
      { test: /\.bmp$/, loader: 'url-loader?mimetype=image/bmp' },
      { test: /\.png$/, loader: 'url-loader?mimetype=image/png' }
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CheckerPlugin(),
    new webpack.optimize.CommonsChunkPlugin('init'),
    new HtmlWebpackPlugin({
      title: pathName,
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
      template: './' + pathName + '/' + option + '/index.ejs',
    })
  ],
  devtool: 'source-map',
  profile: false,

  devServer: {
    contentBase: './',
    port: 3000,

    hot: true,
    inline: true,
    historyApiFallback: true,
    stats: 'normal',
  },
}
