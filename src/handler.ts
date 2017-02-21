import { ModuleAPI } from './module'

export interface Handler {
  (any): HandlerInterface
}

// interface function passed via ModuleDef
export interface HandlerInterface {
  (mod: ModuleAPI): HandlerObject
}

export interface HandlerObject {
  state: any
  handle: HandlerFunction
  dispose: {
    (): void
  }
}

export interface HandlerFunction {
  (value: HandlerMsg): void
}

export interface HandlerMsg {
  [interfaceName: string]: any
}
