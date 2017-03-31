import { runWorker } from '../../utils/worker'
import { viewHandler } from '../../interfaces/view'
import { logFns } from '../../utils/log'

// all communicatios are transfered via postMessage
runWorker({
  worker: new (<any> require('worker-loader!./worker')),
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})
