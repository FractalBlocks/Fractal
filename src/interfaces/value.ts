import { Context, InterfaceHandler, InterfaceMsg, dispatch, EventData, DispatchData } from '../index'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

export interface ValueResponse extends InterfaceMsg {
  _dispatch: {
    (dispatchData: DispatchData): void
  }
}

export interface ValueInterface {
  (ctx: Context, s): InterfaceMsg
}

export const valueHandler: InterfaceHandler = (cb: (evRes: ValueResponse) => void) => mod => {
  function subscriber (driverMsg: InterfaceMsg) {
    driverMsg['_dispatch'] = dispatchData => {
      mod.dispatch(dispatchData)
    }
    cb(<ValueResponse> driverMsg)
  }
  return {
    state$: undefined,
    attach(handler$) {
      handler$.subscribe(subscriber)
      // get first calculation
      subscriber(handler$.get())
    },
    reattach(handler$) {
      handler$.subscribe(subscriber)
      subscriber(handler$.get())
    },
    dispose() {}
  }
}
