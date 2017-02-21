import { run } from '../../src'
import { workerInterfaces } from '../../src/utils/worker'

let app = run({
  root: require('./app').default,
  mergeInterfaces: workerInterfaces(['view']),
})

// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.reattach(m)
  })
}
