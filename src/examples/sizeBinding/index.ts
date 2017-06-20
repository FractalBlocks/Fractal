import {
  run,
  // DEV
  logFns,
  mergeStates,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

declare const ENV: any

let DEV = ENV === 'development'

const app = run({
  root,
  groups: {
    style: styleHandler('app-style', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...DEV ? logFns : {},
})

// import { ResizeSensor } from '../../interfaces/view/resizeSensor'

// let el = document.getElementById('el')

// new ResizeSensor(el, () => {
//   console.log(el.getBoundingClientRect().width, 'BBox')
// })

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./Root', () => {
    let m = require('./Root')
    app.moduleAPI.reattach(<any> m, mergeStates)
  })
}
