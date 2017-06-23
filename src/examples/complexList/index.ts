import {
  mergeStates,
} from '../../core'
import { runModule } from './module'

import * as root from './Root'

declare const ENV: any

let DEV = ENV === 'development'

const app = runModule(root, DEV)

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./Root', () => {
    let m = require('./Root')
    app.moduleAPI.reattach(m, mergeStates)
  })
}
