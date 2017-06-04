import { runWorker, logFns } from '../../core'
import { styleHandler } from '../../groups/style'
import { viewHandler } from '../../interfaces/view'

// all communicatios are transfered via postMessage
runWorker({
  worker: new (<any> require('worker-loader!./worker')),
  groups: {
    style: styleHandler('', true),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})
