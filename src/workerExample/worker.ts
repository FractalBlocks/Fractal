import { run, workerHandler, makeSyncQueue, workerListener } from '../core'
import * as Root from './Root'

const DEV = true

const syncQueue = makeSyncQueue()

run({
  Root,
  onBeforeInit: workerListener(syncQueue),
  record: DEV,
  log: DEV,
  groups: {
    style: workerHandler('group', 'style', syncQueue),
  },
  interfaces: {
    view: workerHandler('interface', 'view', syncQueue),
  },
})
