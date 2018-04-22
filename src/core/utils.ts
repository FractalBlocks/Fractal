import { Context, deepmerge } from '.'

/**
 * Deep clone object
 * @param object Object to clone
 * @returns The cloned object
 */
export function clone <T>(object: T): T {
  var out, v, key
  out = Array.isArray(object) ? [] : {}
  for (key in object) {
      v = object[key]
      out[key] = (typeof v === 'object') ? clone (v) : v
  }
  return out
}

export const isServer = typeof window === 'undefined'

export const isBrowser = !isServer

export const hydrateState = <S>(ctx: Context<S>) => {
  if ((window as any).ssrInitialized) {
    let components = (window as any).ssrComponents
    let name
    for (name in components) {
      ctx.components[name].state = deepmerge(ctx.components[name].state, components[name].state)
    }
  }
}
