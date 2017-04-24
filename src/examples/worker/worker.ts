import { run } from '../../core'
import { workerHandler, workerLog, workerListener } from '../../worker'

let app = run({
  root: require('./app').default,
  beforeInit: workerListener,
  groups: {
    style: workerHandler('group', 'style'),
  },
  interfaces: {
    view: workerHandler('interface', 'view'),
  },
  warn: workerLog('warn'),
  error: workerLog('error'),
})

// Hot reload - doesnt work in a worker for now
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m)
  })
}
