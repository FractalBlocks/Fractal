import { Context, InterfaceHandler, InterfaceMsg, dispatch, EventData, DispatchData, Module } from '../index'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

export type EventMsg = InterfaceMsg

export interface EventResponse extends InterfaceMsg {
  _dispatch: {
    (dispatchData: DispatchData): void
  }
}

export const eventHandler = (cb: (interfaceMsg: InterfaceMsg) => void) => (mod: Module): InterfaceHandler => {
  function subscriber (driverMsg: EventResponse) {
    driverMsg._dispatch = dispatchData => {
      dispatch(mod, dispatchData)
    }
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
