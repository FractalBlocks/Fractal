import {
  run,
  // DEV
  logFns,
  mergeStates,
} from '../../core'
import { styleHandler } from '../../groups/style'
import { viewHandler } from '../../interfaces/view'

import * as root from './App'

let app = run({
  root,
  groups: {
    style: styleHandler(),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./App', () => {
    let m = require('./App')
    app.moduleAPI.reattach(m, mergeStates)
  })
}
