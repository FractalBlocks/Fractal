import { VNode, VNodeData } from './vnode'
import { Module } from 'snabbdom/modules/module'
import { InputData, ModuleAPI } from '../../core'
import { ResizeSensor } from './resizeSensor'

export type SizeBinding = InputData | InputData[] | 'ignore'

// TODO: CRITICAL, improve performance or deprecate this way in favor of task size evaluator

/* istanbul ignore next */
export const sizeBindingModule = (mod: ModuleAPI): Module => {

  function invokeHandler (evHandler: SizeBinding, vnode: VNode, eventData) {
    if (evHandler instanceof Array && typeof evHandler[0] === 'string') {
      setTimeout(() => {
        mod.dispatchEv(eventData, <InputData> evHandler)
      }, 0)
    } else if (evHandler instanceof Array) {
      // call multiple handlers
      for (var i = 0; i < evHandler.length; i++) {
        invokeHandler(evHandler[i], vnode, eventData)
      }
    } else if (evHandler === 'ignore') {
      // this handler is ignored
      return
    } else if (evHandler === '' && evHandler === undefined) {
      // this handler is passed
      return
    } else {
      mod.error('ViewInterface-sizeBindingModule', 'event handler of type ' + typeof evHandler + 'are not allowed, data: ' + JSON.stringify(evHandler))
    }
  }

  function createListener () {
    return function handler() {
      var vnode = (handler as any).vnode
      var evHandler = vnode.data.size
      var eventData = vnode.elm.getBoundingClientRect()
      invokeHandler(evHandler, vnode, eventData)
    }
  }

  function updateSizeListener (oldVnode: VNode, vnode?: VNode): void {
    var oldSize = (oldVnode.data as VNodeData).size,
        oldResizeListener = (oldVnode as any).resizeListener,
        oldResizeSensor = (oldVnode as any).resizeSensor,
        size = vnode && (vnode.data as VNodeData).size,
        elm: HTMLElement = (vnode && vnode.elm) as HTMLElement

    // optimization for reused immutable handlers
    if (oldSize === size) {
      return
    }

    // remove existing listeners which no longer used
    if (oldSize && oldResizeListener) {
      // if element changed or deleted we remove all existing listeners unconditionally
      if (!size) {
        // remove listener if element was changed or existing listeners removed
        oldResizeSensor.detach(oldResizeListener)
      }
    }

    // add new listeners which has not already attached
    if (size) {
      // reuse existing listener or create new
      var resizeListener = (vnode as any).resizeListener = (oldVnode as any).listener || createListener()
      ;(vnode as any).resizeSensor = (oldVnode as any).listener || new ResizeSensor(elm, resizeListener)
      // update vnode for listener
      resizeListener.vnode = vnode
    }
  }

  return {
    create: updateSizeListener,
    update: updateSizeListener,
    destroy: updateSizeListener,
  } as any
}

export default sizeBindingModule
