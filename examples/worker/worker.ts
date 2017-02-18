import { run } from '../../src'
import { workerInterface } from '../../src/utils/worker'

let app = run({
  root: require('./app').default,
  interfaces: {
    view: workerInterface('view'),
  },
})

// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.reattach(m)
  })
}
