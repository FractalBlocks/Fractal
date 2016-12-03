import { InterfaceDriver, InterfaceMsg } from '../../src/interface'

interface ViewMsg extends InterfaceMsg {
  tagName: string
  content: string
}

export default function(): InterfaceDriver {
  function subscriber(driverMsg: ViewMsg) {
    console.log(driverMsg.content)
  }
  return {
    attach(driver$) {
      driver$.subscribe(subscriber)
    },
    reattach(driver$) {
      driver$.subscribe(subscriber)
    },
    dispose(driver$) {
      driver$.unsubscribe(subscriber)
    }
  }
}
