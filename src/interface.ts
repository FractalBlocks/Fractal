import { Stream } from './stream'
import { DispatchFunction } from './module'

export interface InterfaceHandler {
  (any): {
    (dispatch: DispatchFunction): InterfaceHandlerObject
  }
}

export interface InterfaceHandlerObject {
  state$: Stream<any> | undefined
  attach(driver$: Stream<InterfaceMsg>): void
  reattach(driver$: Stream<InterfaceMsg>): void
  dispose(driver$: Stream<InterfaceMsg>): void
}

export interface InterfaceMsg {
  [interfaceName: string]: any
}
