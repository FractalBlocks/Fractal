import { Driver, DriverMsg } from '../../src/driver'

export default function(cb: (driverMsg: DriverMsg) => void): Driver {
  function subscriber(driverMsg: DriverMsg) {
    cb(driverMsg)
  }
  return {
    attach() {

    }
  }
}
