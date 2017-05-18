import { run } from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'
import { logFns } from '../../log' // DEV ONLY
import { mergeStates } from '../../reattach' // DEV ONLY

import * as root from './Root'

const app = run({
  root,
  groups: {
    style: styleHandler('app-style'),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./Root', () => {
    let m = require('./Root')
    app.moduleAPI.reattach(m, mergeStates)
  })
}
