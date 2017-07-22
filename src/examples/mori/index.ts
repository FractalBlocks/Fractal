import {
  run,
  // DEV
  logFns,
  mergeStates,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

import * as root from './App'

;(async () => {
  let app = await run({
    root,
    groups: {
      style: styleHandler('', true),
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
})()
