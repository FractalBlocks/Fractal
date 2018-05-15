import { ModuleAPI } from './module'

// Not used at all only for code documentation
export interface Handler {
  (...params): HandlerInterface | Promise<HandlerInterface>
}

// interface function passed via ModuleDef
export interface HandlerInterface {
  (mod: ModuleAPI): HandlerObject | Promise<HandlerObject>
}

export interface HandlerObject {
  state: any
  handle: HandlerFunction
  destroy: {
    (): void | Promise<void>
  }
}

export interface HandlerFunction {
  (id: string, value: HandlerMsg): Promise<any>
}

export type HandlerMsg = any
