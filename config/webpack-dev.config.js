import merge from 'webpack-merge'

import commonConfig from './examples-common.config.js'

export default merge(commonConfig, {
  debug: true,
  devtool: "cheap-module-inline-source-map",
  profile: false,

  /*watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },*/

  devServer: {
    contentBase: "./public",
    port: 3000,

    hot: true,
    inline: true,
    historyApiFallback: true,

    colors: true,
    stats: 'normal',
  },
})
