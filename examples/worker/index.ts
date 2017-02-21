import { runWorker } from '../../src/utils/worker'
import { viewHandler } from '../../src/interfaces/view'
import { logFns } from '../../src/utils/log'

// all communicatios are transfered via postMessage
let moduleWorker = runWorker({
  worker: require("worker-loader!./worker"),
  task: {

  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})
