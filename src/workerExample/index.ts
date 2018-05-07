import { runWorker } from '../core'
import { styleHandler } from '../groups/style'
import { viewHandler } from '../interfaces/view'

const DEV = true

runWorker({
  Root: 'in-worker', // no matter what you put here ;)
  worker: new Worker('worker.js'),
  record: DEV,
  log: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
})
