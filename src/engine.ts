import { ModuleDef, Module, Model, Action } from './core'
import { Context } from './composition'
import { Driver, Drivers } from './driver'

export interface EngineDef {
  log?: boolean
  logAll?: boolean
  module: Module
  drivers?: Drivers
}

export interface Engine {
  engineDef: EngineDef
  reattach(module: Module): void
  dispose(): void
}

export default function run(engineDef: EngineDef): Engine {
  let defaults = {
    log: false,
    logAll: false,
  }
  engineDef = Object.assign(defaults, engineDef)
  let ctx: Context = {}
  let state: Model = {
    key: 'MainModule',
  }
  console.log(engineDef.module.moduleDef.interfaces['view'](ctx, state))
  return {
    engineDef,
    reattach: (m: Module) => {},
    dispose: () => {},
  }
}
