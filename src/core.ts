import { Stream, newStream } from './stream'
import { run } from './engine'
import { Context } from './composition'
import { InterfaceMsg } from './interface'

export interface ModuleDef<Model> {
  name: string
  log?: boolean
  logAll?: boolean
  init(params: Model): Model
  inputs: InputsDef<Model>
  actions?: ActionsDef<Model>
  interfaces: Interfaces<Model>
}

export interface Interfaces<Model> {
  [interfaceName: string]: Interface<Model>
}

export interface Model {
  key: string
}

export interface InputsDef<Model> {
  [inputName: string]: Input<Model>
}

export interface Input<Model> {
  (ctx: Context): {
    (data: any): Update<Model> | void | Task
  }
}

export interface ActionsDef<Model> {
  [actionName: string]: Action<Model>
}

export interface Action<Model> {
  (data: any): Update<Model>
}

export interface Task extends Array<any> {
  0: string // task name
  1: string // task function
  2: Object // task data
}

export interface Update<Model> {
  (state: Model): Model
}

export interface Interface<Model> {
  (ctx: Context, state: Model): InterfaceMsg
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
