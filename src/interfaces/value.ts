import { Context, InterfaceHandler, InterfaceMsg, DispatchData } from '../index'

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
  return {
    state: undefined,
    handle(driverMsg) {
      driverMsg['_dispatch'] = dispatchData => {
        mod.dispatch(dispatchData)
      }
      cb(<ValueResponse> driverMsg)
    },
    dispose() {}
  }
}
