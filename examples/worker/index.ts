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
  warn,
  error,
})
