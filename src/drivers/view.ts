import { Driver, DriverMsg } from '../../src/driver'

interface ViewMsg extends DriverMsg {
  tagName: string
  content: string
}

const driver: Driver = {
  attach(driverMsg: ViewMsg) {
    console.log(driverMsg.content)
  }
}

export default driver
