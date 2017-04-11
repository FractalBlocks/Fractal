import { Context, ModuleAPI, HandlerMsg, EventData } from '../core'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

export interface ValueResponse {
  _dispatch: {
    (eventData: EventData): void
  }
}

export interface ValueInterface {
  (ctx: Context<any>, s): HandlerMsg
}

export const valueHandler = (cb: (evRes: ValueResponse) => void) => (mod: ModuleAPI) => {
  return {
    state: undefined,
    handle(driverMsg) {
      driverMsg['_dispatch'] = eventData => {
        mod.dispatch(eventData)
      }
      cb(<ValueResponse> driverMsg)
    },
    dispose() {}
  }
}
