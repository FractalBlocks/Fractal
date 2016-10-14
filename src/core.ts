import { Stream, newStream } from './stream'
import run from './engine'
import { Context } from './composition'
import { DriverMsg } from './driver'

export interface ModuleDef<Model> {
  name: string
  log?: boolean
  logAll?: boolean
  init(params: Model): Model
  actions?: ActionsDef<Model>
  interfaces: {
    [interfaceName: string]: Interface
  }
}

export interface Model {
  key: string
  [propName: string]: any
}

export interface ActionsDef<Model> {
  [actionName: string]: Action<Model>
}

export interface Action<Model> {
  (data: any, state: Model): Model
}

export interface Interface {
  (ctx: Context, state: Model): DriverMsg
}

export function def(moduleDef: ModuleDef<Model>) : ModuleDef<Model> {
  let defaults = {
    log: false,
    logAll: false,
  }
  let mDef = Object.assign(defaults, moduleDef)
  return mDef
}

export default {
  def,
  run,
}
