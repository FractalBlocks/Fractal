// Running Fractal in a worker thread

import { runWorker } from '../core'
import { styleHandler } from '../groups/style'
import { viewHandler } from '../interfaces/view'

const DEV = true

runWorker({
  Root: 'in-worker', // no matter what you put here ;) because Root component is imported inside the worker
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

// Running Fractal in the main thread

// import { run } from '../core'
// import { styleHandler } from '../groups/style'
// import { viewHandler } from '../interfaces/view'
// import * as Root from './Root'

// const DEV = true

// run({
//   Root,
//   record: DEV,
//   log: DEV,
//   groups: {
//     style: styleHandler('', DEV),
//   },
//   interfaces: {
//     view: viewHandler('#app'),
//   },
// })
