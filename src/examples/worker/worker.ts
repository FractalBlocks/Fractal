import { run, workerHandler, workerLog, workerListener, makeSyncQueue } from '../../core'

import * as root from './App'

;(async () => {
  let syncQueue = makeSyncQueue()
  let app = await run({
    root,
    beforeInit: workerListener(syncQueue),
    groups: {
      style: workerHandler('group', 'style', syncQueue),
    },
    interfaces: {
      view: workerHandler('interface', 'view', syncQueue),
    },
    warn: workerLog('warn'),
    error: workerLog('error'),
  })

  // Hot reload - doesnt work in a worker for now
  if (module.hot) {
    module.hot.accept('./App', () => {
      let m = <any> require('./App')
      app.moduleAPI.reattach(m)
    })
  }
})()
