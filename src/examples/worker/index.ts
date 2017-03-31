import { runWorker } from '../../utils/worker'
import { viewHandler } from '../../interfaces/view'
import { logFns } from '../../utils/log'

// all communicatios are transfered via postMessage
runWorker({
  worker: new (<any> require('worker-loader!./worker')),
  interfaces: {
    view: viewHandler('#app'),
  },
  /* NOTE: this would be defined in the module (worker.ts)
     if your run the module over a webworker
     is implemented this way for showing how you can communicate over any workerAPI
     you can run worket.ts in the server via websockets or even remotely in a client via webRTC!!
  */
  // DEV ONLY (you can handle it manually)
  ...logFns,
})
