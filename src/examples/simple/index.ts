import { run } from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'
import { logFns } from '../../log' // DEV ONLY
import { mergeStates } from '../../reattach' // DEV ONLY

import * as root from './app'

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
  module.hot.accept('./app', () => {
    let m = require('./app')
    app.moduleAPI.reattach(m, mergeStates)
  })
}
