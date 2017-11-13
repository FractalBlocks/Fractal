import Navigo = require('navigo')
import { Handler, computeEvent } from '../core'

export const routesHandler: Handler = () => ctx => {
  var useHash = true; // Defaults to: false
  var hash = '#!'; // Defaults to: '#'
  var router
  var isFirst = true
  var currentURL = '/'

  async function handle (value) {
    if (router) {
      router.destroy()
    }
    if (currentURL !== value.name) {
      currentURL = value.name
      window.location.href = window.location.href.replace(/#(.*)$/, '') + hash + currentURL
    }
    router = new Navigo(null, useHash, hash)
    let routes = {}, key
    for (key in value) {
      if (key !== 'name') {
        routes[key] = (params, query) => {
          ctx.dispatchEv({ params, query }, value[key])
        }
      }
    }

    router.on(routes)

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

export interface Routes<S> {
  (ctx): {
    (s: S): {
      [regExp: string]: any
    }
  }
}
