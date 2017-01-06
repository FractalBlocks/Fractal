import { InterfaceHandler, InterfaceMsg } from '../interface'
import { Stream } from '../stream'
import { Model } from '../core'

export default function(cb: (interfaceMsg: InterfaceMsg) => void): InterfaceHandler {
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
