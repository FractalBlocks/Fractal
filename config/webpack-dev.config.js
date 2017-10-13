const helpers = require('./helpers')
const path = require('path')

const DefinePlugin = require('webpack/lib/DefinePlugin')
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin')
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ENV = process.env.ENV = process.env.NODE_ENV = 'development'

module.exports = function (options) {
  return {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.ts$/,
          loader: 'source-map-loader',
          exclude: [
          ]
        },
        {
          test: /\.ts$/,
          loader: 'awesome-typescript-loader',
          query: {
            sourceMap: false,
            inlineSourceMap: true,
            compilerOptions: {
              removeComments: true,
            }
          },
          exclude: [/\.e2e\.ts$/]
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },

      ]
    },
    plugins: [
      new DefinePlugin({
        'ENV': JSON.stringify(ENV),
        'HMR': false,
        'process.env': {
          'ENV': JSON.stringify(ENV),
          'NODE_ENV': JSON.stringify(ENV),
          'HMR': false,
        }
      }),
      new HtmlWebpackPlugin({
        template: 'src/playground/index.ejs',
        inject: 'body',
      }),

    ],

    node: {
      global: true,
      process: false,
      crypto: 'empty',
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  }
}
