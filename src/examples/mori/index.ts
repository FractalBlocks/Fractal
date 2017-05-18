import { run } from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'
import { logFns } from '../../log' // DEV ONLY
import { mergeStates } from '../../reattach' // DEV ONLY

import * as root from './App'

let app = run({
  root,
  groups: {
    style: styleHandler('app-style'),
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
