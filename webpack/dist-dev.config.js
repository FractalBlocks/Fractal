var StatsPlugin = require('stats-webpack-plugin')
var webpack = require('webpack')


module.exports = {
  target: 'web',
  entry: {
    fractal: './lib/index.js',
  },
  devtool: 'source-map',
  output: {
    path: './dist',
    filename: 'fractal.js',
    sourceMapFilename: 'fractal.map',
    libraryTarget: 'umd',
    library: 'fractal',
    umdNamedDefine: true,
  },
  module: {
    loaders: [
      {
        test: /.js/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'es2017'],
          plugins: [
            ['transform-runtime', {
              helpers: false,
              polyfill: false,
              regenerator: true,
            }],
            'transform-es2015-destructuring',
            'transform-object-rest-spread',
            'transform-async-to-generator',
          ],
        },
      },
    ],
  },
  plugins: [
    new StatsPlugin('webpack-stats.json', {
      chunkModules: true,
    }),
  ],
}
