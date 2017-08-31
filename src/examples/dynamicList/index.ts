import {
  run,
  // DEV
  logFns,
  mergeStates,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

;(async ()=> {
  const app = await run({
    root,
    groups: {
      style: styleHandler('', true),
    },
    interfaces: {
      view: viewHandler('#app'),
    },
    ...logFns,
  })

  // Hot reload - DEV ONLY
  if (module.hot) {
    module.hot.accept('./Root', () => {
      let m = <any> require('./Root')
      app.moduleAPI.reattach(m, mergeStates)
    })
  }
})()
