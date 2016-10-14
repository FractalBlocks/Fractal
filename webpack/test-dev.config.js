'use strict'

// TODO: evaluate testing
let hostname = 'localhost'
let port = 8080

module.exports = {
    entry: 'mocha!./tests/index.js',
    output: {
        filename: 'test.build.js',
        path: 'tests/',
        publicPath: 'http://' + hostname + ':' + port + '/tests'
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            {
                test: /(\.css|\.less)$/,
                loader: 'null-loader',
                exclude: [
                    /build/
                ]
            },
            {
                test: /(\.jpg|\.jpeg|\.png|\.gif)$/,
                loader: 'null-loader'
            }
        ]
    },
    devServer: {
        host: hostname,
        port: port
    }
}
