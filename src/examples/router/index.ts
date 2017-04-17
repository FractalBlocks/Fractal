import { run, Handler, computeEvent } from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'
import { logFns } from '../../utils/log' // DEV ONLY
import { mergeStates } from '../../utils/reattach' // DEV ONLY
import Navigo = require('navigo')

import * as root from './root'

const routesHandler: Handler = () => ctx => {

  var useHash = true; // Defaults to: false
  var hash = '#!'; // Defaults to: '#'
  var router
  var isFirst = true
  var currentURL = '/'

  function handle (value) {
    if (router) {
      router.destroy()
    }
    if (currentURL !== value._) {
      currentURL = value._
      window.location.href = window.location.href.replace(/#(.*)$/, '') + hash + currentURL
    }
    router = new Navigo(null, useHash, hash)
    let routes = {}
    for (let i = 0, keys = Object.keys(value), len = keys.length; i < len; i++) {
      if (keys[i] !== '_') {
        routes[keys[i]] = (params, query) => {
          ctx.dispatch(computeEvent({ params, query }, value[keys[i]]))
        }
      }
    }
    router
      .on(routes)
    if (isFirst) {
      isFirst = false
      router.resolve()
    }
  }

  return {
    state: router,
    handle,
    dispose: () => router.destroy(),
  }

}

const app = run({
  root,
  groups: {
    style: styleHandler('app-style'),
  },
  interfaces: {
    view: viewHandler('#app'),
    routes: routesHandler(),
  },
  ...logFns,
})

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./root', () => {
    let m = require('./root')
    app.moduleAPI.reattach(m, mergeStates)
  })
}
