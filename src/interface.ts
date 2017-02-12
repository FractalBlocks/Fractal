import { Stream } from './stream'
import { ModuleAPI } from './module'

export interface InterfaceHandler {
  (any): InterfaceFunction
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

// interface function passed via ModuleDef
export interface InterfaceFunction {
  (mod: ModuleAPI): InterfaceHandlerObject
}
