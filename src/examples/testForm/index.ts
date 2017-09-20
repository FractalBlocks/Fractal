import { mergeComponents } from '../../core'
import { runModule } from './module'

import * as root from './Root'

declare const ENV: any

let DEV = ENV === 'development'

;(async () => {

  const app = await runModule(root, DEV)

  // Hot reload - DEV ONLY
  if (module.hot) {
    module.hot.accept('./Root', () => {
      let m = <any> require('./Root')
      app.moduleAPI.reattach(m, mergeComponents)
    })
  }
})()
