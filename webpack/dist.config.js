var webpack = require('webpack')
let CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  entry: {
    fractalEngine: "./lib/index.js",
  },
  output: {
      path: './dist',
      filename: 'fractal.min.js',
      libraryTarget: 'umd',
      library: 'fractal',
      umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /.js/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'es2017'],
          plugins: [
            'transform-runtime',
            'transform-es2015-destructuring',
            'transform-object-rest-spread',
            'transform-async-to-generator'
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        mangle: false
    }),
    new CompressionPlugin({
      asset: "{file}.gz",
      algorithm: "gzip",
      regExp: new RegExp("\.(js|html|css|svg)$"),
      threshold: 10240,
      minRatio: 0.8,
    })
  ],
}
