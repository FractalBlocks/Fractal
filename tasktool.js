// task tool for developing and compile examples and any subproject
// for development use with: npm run general PROJECT_NAME FOLDER_NAME
// e.j. npm run general playground examples
// for compile use with: npm run general PROJECT_NAME FOLDER_NAME
// e.j. npm run general-compile playground examples
// NOTE: by default FOLDER_NAME is examples, this allows to do that: npm run general playground
// TODO: document examples

var spawn = require('child_process').spawn

var option = process.argv[2]
var path = process.argv[3] || 'examples'

process.env.OPTION = option
process.env.OPTION_PATH = path

var cmd

if (process.env.NODE_ENV.trim() == 'development') {

  console.log('Development server for ' + path + '/' + option + ' launched ...')
  cmd = spawn('node', [
    'node_modules/webpack-dev-server/bin/webpack-dev-server.js',
    '--config', 'webpack/generalDevServer.config.js',
    '--progress'
  ])
} else {
  console.log('Compiler for ' + path + '/' + option + ' launched ...')
  cmd = spawn('node', [
    'node_modules/webpack/bin/webpack.js',
    '--config', 'webpack/generalDist.config.js',
    '--progress'
  ])
}

cmd.stdout.on('data', function (data) {
  console.log(data + '')
})

cmd.stderr.on('data', function (data) {
  console.log(data + '')
})

cmd.stderr.on('error', function (data) {
  console.log(data + '')
})

cmd.on('exit', function (code) {
  console.log('child process exited with code ' + code)
})
