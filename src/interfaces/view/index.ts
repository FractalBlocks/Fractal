import { Interface, ModuleAPI, Handler } from '../../core'
import { init } from 'snabbdom'
import classModule from 'snabbdom/modules/class'
import attributesModule from 'snabbdom/modules/attributes'
import propsModule from 'snabbdom/modules/props'
import styleModule from 'snabbdom/modules/style'
import eventListenersModule from './eventListeners'
import globalListenersModule from './globalListeners'
import sizeBindingModule from './sizeBinding'
import { default as _h } from './h'
import { VNode as _VNode } from './vnode'

export const h = _h
export type VNode = _VNode

export type View<S> = Interface<VNode, S>

/* istanbul ignore next */
export const viewHandler: Handler = (selectorElm, cb?: { (value: VNode): void }) => (mod: ModuleAPI) => {
  let selector = (typeof selectorElm === 'string') ? selectorElm : ''
  let state: { lastContainer: VNode | Element } = {
    lastContainer: undefined,
  }

  // Common snabbdom patch function (convention over configuration)
  let patchFn = init([
    classModule,
    attributesModule,
    propsModule,
    styleModule,
    eventListenersModule(mod),
    globalListenersModule(mod, state),
    sizeBindingModule(mod),
  ])

  function handler (vnode: VNode) {
    let vnode_mapped = h('div' + selector, { key: selector }, [vnode])
    state.lastContainer = <any> patchFn(<any> state.lastContainer, <any> vnode_mapped)
  }

  return {
    state,
    handle: async (value: VNode) => {
      if (typeof window === 'undefined') {
        if (cb) {
          cb(value)
        }
        return
      }
      if (!state.lastContainer) {
        let container = selector !== '' ? document.querySelector(selector) : selectorElm
        if (!container) {
          return mod.error('view', `There are no element matching selector '${selector}'`)
        }
        state.lastContainer = container
        handler(<any> state.lastContainer)
        handler(value)
      } else {
        handler(value)
      }
      if (cb) {
        cb(value)
      }
    },
    dispose: () => {},
  }
}
