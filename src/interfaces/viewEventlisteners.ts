import { VNode, VNodeData } from 'snabbdom/vnode'
import { Module } from 'snabbdom/modules/module'
import { computeEvent, InputData } from '../index'

export const eventListenersModule = (dispatch): Module => {

  function invokeHandler(handler: InputData, event?: Event): void {
    if (handler instanceof Array && typeof handler[0] === 'string') {
      // call function handler
      dispatch(computeEvent(event, handler))
    } else {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i])
      }
    }
  }

  function handleEvent(event: Event, vnode: VNode) {
    var name = event.type,
        on = (vnode.data as VNodeData).on

    // call event handler(s) if exists
    if (on && on[name]) {
      invokeHandler(on[name], event)
    }
  }

  function createListener() {
    return function handler(event: Event) {
      requestAnimationFrame(() => {
        setTimeout(() => {
            handleEvent(event, (handler as any).vnode)
        }, 0)
      })
    }
  }

  function updateEventListeners(oldVnode: VNode, vnode?: VNode): void {
    var oldOn = (oldVnode.data as VNodeData).on,
        oldListener = (oldVnode as any).listener,
        oldElm: Element = oldVnode.elm as Element,
        on = vnode && (vnode.data as VNodeData).on,
        elm: Element = (vnode && vnode.elm) as Element,
        name: string

    // optimization for reused immutable handlers
    if (oldOn === on) {
      return
    }

    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
      // if element changed or deleted we remove all existing listeners unconditionally
      if (!on) {
        for (name in oldOn) {
          // remove listener if element was changed or existing listeners removed
          oldElm.removeEventListener(name, oldListener, false)
        }
      } else {
        for (name in oldOn) {
          // remove listener if existing listener removed
          if (!on[name]) {
            oldElm.removeEventListener(name, oldListener, false)
          }
        }
      }
    }

    // add new listeners which has not already attached
    if (on) {
      // reuse existing listener or create new
      var listener = (vnode as any).listener = (oldVnode as any).listener || createListener()
      // update vnode for listener
      listener.vnode = vnode

      // if element changed or added we add all needed listeners unconditionally
      if (!oldOn) {
        for (name in on) {
          // add listener if element was changed or new listeners added
          elm.addEventListener(name, listener, false)
        }
      } else {
        for (name in on) {
          // add listener if new listener added
          if (!oldOn[name]) {
            elm.addEventListener(name, listener, false)
          }
        }
      }
    }
  }

  return {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners,
  } as Module
}

export default eventListenersModule
