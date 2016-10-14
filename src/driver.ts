export interface Drivers {
  [driverName: string]: Driver
}

export interface Driver {
  attach(driverMsg: DriverMsg): void
}

export interface DriverMsg {
  [interfaceName: string]: any
}
