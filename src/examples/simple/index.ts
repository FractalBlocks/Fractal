import {
  run,
  // DEV
  logFns,
  mergeComponents,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

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
    module.hot.accept('./Root', () => {
      let m = <any> require('./Root')
      app.moduleAPI.reattach(m, mergeComponents)
    })
  }
})()
