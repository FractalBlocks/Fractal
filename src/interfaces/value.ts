import { Context, Handler, HandlerMsg, EventData } from '../index'

// this interface is not nestable because dont use the nestable interface pattern (this is used only for testing modules)

export interface ValueResponse extends HandlerMsg {
  _dispatch: {
    (eventData: EventData): void
  }
}

export interface ValueInterface {
  (ctx: Context, s): HandlerMsg
}

export const valueHandler: Handler = (cb: (evRes: ValueResponse) => void) => mod => {
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
