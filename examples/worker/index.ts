import { runWorker, WorkerAPI } from '../../src/utils/worker'
import { viewHandler } from '../../src/interfaces/view'
import { warn, error } from '../../src/utils/log'
import { styleTask } from '../../src/tasks/style'

// all communicatios are transfered via postMessage
let moduleWorker = runWorker({
  worker: new (<any> require('worker-loader!./worker')),
  tasks: {
    style: styleTask('app-styles'),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  /* NOTE: this would be defined in the module (worker.ts)
     if your run the module over a webworker
     is implemented this way for showing how you can communicate over any workerAPI
     you can run worket.ts in the server via websockets or even remotely in a client via webRTC!!
  */
  warn,
  error,
})
