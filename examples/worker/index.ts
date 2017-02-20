import { runWorker } from '../../src/utils/worker'
import { viewHandler } from '../../src/interfaces/view'

// all communicatios are transfered via postMessage
let moduleWorker = runWorker({
  worker: require("worker-loader!./worker.js").default,
  interfaces: {
    view: viewHandler('#app'),
  },
})
