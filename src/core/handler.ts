import { ModuleAPI } from './module'

// Not used at all only for code documentation
export interface Handler {
  (...params): HandlerInterface
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
  (value: HandlerMsg): Promise<any>
}

export type HandlerMsg = any
