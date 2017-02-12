import { Context, InterfaceHandler, InterfaceMsg, dispatch, EventData, DispatchData, ComponentIndex } from '../index'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

export interface EventResponse extends InterfaceMsg {
  _dispatch: {
    (dispatchData: DispatchData): void
  }
}

export interface EventInterface {
  (ctx: Context, s): InterfaceMsg
}

export const eventHandler: InterfaceHandler = (cb: (evRes: EventResponse) => void) => mod => {
  function subscriber (driverMsg: InterfaceMsg) {
    driverMsg['_dispatch'] = dispatchData => {
      mod.dispatch(dispatchData)
    }
    cb(<EventResponse> driverMsg)
  }
  return {
    state$: undefined,
    attach(handler$) {
      handler$.subscribe(subscriber)
      subscriber(handler$.get())
    },
    reattach(handler$) {
      handler$.subscribe(subscriber)
    },
    dispose(handler$) {
      handler$.unsubscribe(subscriber)
    }
  }
}
