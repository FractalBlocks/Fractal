import {
  run,
  // DEV
  logFns,
  mergeStates,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { routesHandler } from '../../interfaces/router'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

;(async () => {
  const app = await run({
    root,
    groups: {
      style: styleHandler('', true),
    },
    interfaceOrder: ['routes'],
    interfaces: {
      view: viewHandler('#app'),
      routes: routesHandler(),
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
})()
