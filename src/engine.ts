import { ModuleDef, Model, Action } from './core'
import { Context, Module } from './composition'
import { Driver, Drivers } from './driver'

export interface EngineDef {
  log?: boolean
  logAll?: boolean
  module: ModuleDef<Model>
  drivers?: Drivers
}

export interface Engine {
  engineDef: EngineDef
  reattach(module: ModuleDef<Model>): void
  dispose(): void
}

export default function run(engineDef: EngineDef): Engine {
  let defaults = {
    log: false,
    logAll: false,
  }
  engineDef = Object.assign(defaults, engineDef)
  let module = engineDef.module
  let ctx: Context = {}
  let state = module.init({key: module.name})

  return {
    engineDef,
    reattach(m: ModuleDef<Model>) {},
    dispose() {},
  }
}
