import { InterfaceDriver, InterfaceMsg } from '../interface'
import { Stream } from '../stream'
import { Model } from '../core'

export default function(cb: (interfaceMsg: InterfaceMsg) => void): InterfaceDriver {
  function subscriber(driverMsg: InterfaceMsg) {
    cb(driverMsg)
  }
  return {
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
