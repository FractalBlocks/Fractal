import { InterfaceHandler, InterfaceMsg } from '../interface'
import { Stream } from '../stream'
import { Context } from '../core'

export interface EventInterface {
  (ctx: Context, s): InterfaceMsg
}

export function eventHandler (cb: (interfaceMsg: InterfaceMsg) => void): InterfaceHandler {
  function subscriber(driverMsg: InterfaceMsg) {
    cb(driverMsg)
  }
  return {
    state$: undefined,
    attach(driver$) {
      driver$.subscribe(subscriber)
      subscriber(driver$.get())
    },
    reattach(driver$) {
      driver$.subscribe(subscriber)
    },
    dispose(driver$) {
      driver$.unsubscribe(subscriber)
    }
  }
}
