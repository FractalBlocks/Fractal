import { run } from '../../src'
import { workerInterface } from '../../src/utils/worker'

let app = run({
  root: require('./app').default,
  init: mod => {
    // allows to dispatch inputs from the main thread
    self.onmessage = ev => {
      let data = ev.data
      if (data[0] === 'dispatch') {
        return mod.dispatch(data[1])
      }
    }
  },
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
