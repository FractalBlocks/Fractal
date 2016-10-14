import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

let name = 'fractal'

// let vendorModules = /(node_modules|bower_components)/;

export default {
  target: "node",
  entry: "./server/index.js",

  output: {
    path: "",
    filename: "server.js",
  },

  module: {
    loaders: [
      { test: /\.json/, loader: "json-loader" },
    ],
  },
};
