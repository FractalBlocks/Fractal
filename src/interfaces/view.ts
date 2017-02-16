import { InterfaceHandler, InterfaceMsg } from '../interface'
import { Context } from '../core'
import { init } from 'snabbdom'
import classModule from 'snabbdom/modules/class'
import attributesModule from 'snabbdom/modules/attributes'
import propsModule from 'snabbdom/modules/props'
import eventlistenersModule from 'snabbdom/modules/eventlisteners'
import styleModule from 'snabbdom/modules/style'
import h from 'snabbdom/h'
import { VNode } from 'snabbdom/vnode'
import { newStream, Stream } from '../stream'
import scanMapStream from '../stream/scanMap'

// Common snabbdom patch function (convention over configuration)
const patch = init([
  classModule,
  attributesModule,
  propsModule,
  eventlistenersModule,
  styleModule,
])

export interface ViewInterface {
  (ctx: Context, s): VNode
}

export const viewHandler: InterfaceHandler = (selectorElm, patchfn = patch) => mod => {
  let selector = (typeof selectorElm === 'string') ? selectorElm : ''
  let lastContainer,
    state$ = newStream<VNode>(undefined)

  function wraperPatch(o, n) {
    let newContainer = patchfn(o, n)
    lastContainer = newContainer
    return newContainer
  }

  function subscriber (vnode: VNode) {
    let vnode_mapped = h('div' + selector, { key: selector }, [vnode])
    state$.set(wraperPatch(state$.get(), vnode_mapped))
  }

  return {
    state$,
    attach: (vnode$: Stream<VNode>) => {
      window.addEventListener('DOMContentLoaded', function() {
        let container = selector !== '' ? document.querySelector(selector) : selectorElm
        if (!container) {
          return mod.error('view', `There are no element matching selector '${selector}'`)
        }
        state$.set(container)
        vnode$.subscribe(subscriber)
        subscriber(vnode$.get())
      })
    },
    reattach: (vnode$: Stream<VNode>) => {
      state$.set(lastContainer)
      vnode$.subscribe(subscriber)
      subscriber(vnode$.get())
    },
    dispose: () => {},
  }
}
