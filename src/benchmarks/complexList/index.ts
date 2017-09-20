import {
  run,
  // DEV
  // logFns,
  mergeComponents,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

import * as root from './Root'

;(async () => {
  const app = await run({
    root,
    groups: {
      style: styleHandler(''),
    },
    interfaces: {
      view: viewHandler('#app'),
    },
    // ...logFns,
    afterInput: (ctx, inputName, data) => {
      end = window.performance.now()
      results[i] = end - start
      i++
      setTimeout(() => sim(), 0)
    },
  })

  let input = <HTMLInputElement> document.querySelector('#app input')

  function simulateKeyEvent(el: HTMLElement, name, keyCode, cb) {
    var evt = new KeyboardEvent(name, { bubbles:true })
    Object.defineProperty(evt, 'keyCode', {
      get: function() {
          return this.charCodeVal
      }
    })
    Object.defineProperty(evt, 'which', {
      get: function() {
          return this.charCodeVal
      }
    })
    ;(<any> evt).charCodeVal = keyCode
    el.dispatchEvent(evt)
    if (cb) {
      cb()
    }
  }

  let results = []
  let resultsDisplayed = false
  let start, end
  let i = 0
  let sim = () => i < 10000 ? (() =>{
    input.value = 'Hello guys!! ' + i
    simulateKeyEvent(input, 'keyup', 13, () => {
      start = window.performance.now()
    })
  })() : resultsDisplayed ? 0 : (() => {console.log(JSON.stringify(results)); resultsDisplayed = true})()

  sim()

  // Hot reload - DEV ONLY
  if (module.hot) {
    module.hot.accept('./Root', () => {
      let m = <any> require('./Root')
      app.moduleAPI.reattach(m, mergeComponents)
    })
  }
})()
