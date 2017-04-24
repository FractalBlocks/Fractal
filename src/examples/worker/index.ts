import { runWorker } from '../../worker'
import { styleHandler } from '../../groups/style'
import { viewHandler } from '../../interfaces/view'
import { logFns } from '../../log'

// all communicatios are transfered via postMessage
runWorker({
  worker: new (<any> require('worker-loader!./worker')),
  groups: {
    style: styleHandler(),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})
