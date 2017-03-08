import { run } from '../../src'
import { workerHandler, workerLog, workerListener } from '../../utils/worker'

let app = run({
  root: require('./app').default,
  beforeInit: workerListener,
  tasks: {
    style: workerHandler('task', 'style'),
  },
  interfaces: {
    view: workerHandler('interface', 'view'),
  },
  warn: workerLog('warn'),
  error: workerLog('error'),
})

// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m)
  })
}
