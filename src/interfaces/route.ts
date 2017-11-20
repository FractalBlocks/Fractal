import { Handler } from '../core'

interface LocationObj {
  href: string
  pathname: string
  search: string
  hash: string
}

type RouterMode = 'history' | 'hash'

export const routeHandler: Handler = (root: string, mode: RouterMode = 'history', locationObj?: LocationObj) => mod => {
  let state = {
    parts: undefined,
    pathname: '',
    path: [],
    query: '',
    queryObj: {},
  }
  async function checkAppChanges (parts, isInit: boolean) {
    // build actual app route
    let pathname = '', path = []
    for (let i = 0, part; part = parts[i]; i++) {
      pathname += (pathname ? '/' : '') + part[1]
      path.push([part[0], part[1]])
    }
    state.pathname = root + pathname
    state.path = path
    if (isInit) {
      await checkUrlChanges()
    } else {
      if (mode === 'history') {
        history.pushState(null, null, state.pathname)
      } else {
        locationObj.href = locationObj.href.replace(/#(.*)$/, '') + '#' + state.pathname
      }
    }
  }
  async function checkUrlChanges () {
    let pathname
    if (mode === 'history') {
      pathname = locationObj.pathname
    } else {
      pathname = locationObj.hash.substr(1)
    }
    if (pathname !== state.pathname) {
      let parts = pathname.substr(1).split('/')
      let changed = false
      for (let i = 0, pathPart, part; pathPart = state.path[i]; i++) {
        part = parts[i]
        if (part !== pathPart[1] && !changed) {
          changed = true
          await mod.dispatchEv(part, [pathPart[0], 'Route_active', [part]])
        } else {
          if (changed) {
            await mod.dispatchEv(part, [pathPart[0], 'Route_inactive'])
          }
        }
      }
    }
  }
  if (!locationObj) {
    locationObj = window.location
  }
  if (typeof window !== undefined) {
    setInterval(() => {
      if (!state.parts) return
    }, 50)
  }
  return {
    state,
    handle: async parts => {
      await checkAppChanges(parts, !state.parts)
      state.parts = parts
    },
    dispose: async () => {},
  }
}
