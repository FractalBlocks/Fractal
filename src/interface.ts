import { ModuleAPI } from './module'

export interface InterfaceHandler {
  (any): InterfaceFunction
}

// interface function passed via ModuleDef
export interface InterfaceFunction {
  (mod: ModuleAPI): InterfaceHandlerObject
}

export interface InterfaceHandlerObject {
  state: any
  handle: InterfaceHandlerFunction
  dispose: {
    (): void
  }
}

export interface InterfaceHandlerFunction {
  (value: InterfaceMsg): void
}

export interface InterfaceMsg {
  [interfaceName: string]: any
}
