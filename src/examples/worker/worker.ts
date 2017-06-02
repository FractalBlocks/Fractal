import { run, workerHandler, workerLog, workerListener } from '../../core'

import * as root from './App'

let app = run({
  root,
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
  module.hot.accept('./App', () => {
    let m = require('./App')
    app.moduleAPI.reattach(m)
  })
}
