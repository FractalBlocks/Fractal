import {
  run,
  // DEV
  logFns,
  mergeStates,
  computeEvent,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
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
      size: mod => ({
        state: undefined,
        handle: async ([selector, prop, cb]) => {
          let elements: HTMLElement[] = document.querySelectorAll(selector)
          let propValues = []
          for (let i = 0, len = elements.length; i < len; i++) {
            let element = elements[i]
            let bbox = element.getBoundingClientRect()
            propValues.push(bbox[prop])
          }
          mod.dispatch(computeEvent(propValues, cb))
        },
        dispose: () => {},
      }),
    },
    interfaces: {
      view: viewHandler('#app'),
    },
    ...DEV ? logFns : {},
  })

  // Hot reload - DEV ONLY
  if (module.hot) {
    module.hot.accept('./Root', () => {
      let m = require('./Root')
      app.moduleAPI.reattach(<any> m, mergeStates)
    })
  }
})()
