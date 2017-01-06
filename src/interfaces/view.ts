import { InterfaceHandler, InterfaceMsg } from '../interface'
import snabbdom = require('snabbdom')
import classModule = require('snabbdom/modules/class')
import attributesModule = require('snabbdom/modules/attributes')
import propsModule = require('snabbdom/modules/props')
import eventlistenersModule = require('snabbdom/modules/eventlisteners')
import styleModule = require('snabbdom/modules/style')
import h = require('snabbdom/h')
import { newStream, Stream } from '../stream'
import scanMapStream from '../stream/scanMap'

// Common snabbdom patch function (convention over configuration)
const patch = snabbdom.init([
  classModule,
  attributesModule,
  propsModule,
  eventlistenersModule,
  styleModule,
])

export default function (selector, patchfn = patch): InterfaceHandler {
  let lastContainer,
    state$ = newStream<snabbdom.VNode>(undefined)

  function wraperPatch(o, n) {
    let newContainer = patchfn(o, n)
    lastContainer = newContainer
    return newContainer
  }

  function subscriber (vnode: snabbdom.VNode) {
    let vnode_mapped = h('div' + selector, { key: selector }, [vnode])
    state$.set(wraperPatch(state$.get(), vnode_mapped))
  }

  return {
    state$,
    attach: (vnode$: Stream<snabbdom.VNode>) => {
      window.addEventListener('DOMContentLoaded', function() {
        let container = document.querySelector(selector)
        state$.set(container)
        vnode$.subscribe(subscriber)
        subscriber(vnode$.get())
      })
    },
    reattach: (vnode$: Stream<snabbdom.VNode>) => {
      vnode$.set(lastContainer)
      vnode$.subscribe(subscriber)
      subscriber(vnode$.get())
    },
    dispose: () => {
      state$.unsubscribe(subscriber)
    },
  }
}
