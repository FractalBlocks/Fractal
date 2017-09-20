import {
  run,
  // DEV
  logFns,
  mergeComponents,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { sizeHandler } from '../../tasks/size'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

declare const ENV: any

let DEV = ENV === 'development'

;(async () => {
  const app = await run({
    root,
    groups: {
      style: styleHandler('app-style', DEV),
    },
    tasks: {
      size: sizeHandler(),
    },
    interfaces: {
      view: viewHandler('#app'),
    },
    ...DEV ? logFns : {},
  })

  // Hot reload - DEV ONLY
  if (module.hot) {
    module.hot.accept('./Root', () => {
      let m = <any> require('./Root')
      app.moduleAPI.reattach(m, mergeComponents)
    })
  }
})()
