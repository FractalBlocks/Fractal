import { Stream } from './stream'
import { Model } from './core'

export interface InterfaceHandler {
  state$: Stream<any> | undefined
  attach(driver$: Stream<InterfaceMsg>): void
  reattach(driver$: Stream<InterfaceMsg>): void
  dispose(driver$: Stream<InterfaceMsg>): void
}

export interface InterfaceMsg {
  [interfaceName: string]: any
}
