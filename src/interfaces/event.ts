import { InterfaceHandler, InterfaceMsg } from '../interface'
import { Stream } from '../stream'
import { Context } from '../core'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

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
