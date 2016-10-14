import { ModuleDef, Module, Model, Action } from './core'
import { Context } from './composition'
import { Driver, Drivers } from './driver'
import { Defaults, defaultValues } from './defaults'

export interface EngineDef extends Defaults {
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

const defaults = defaultValues<EngineDef>({
  log: true,
})

export default function run(engineDef: EngineDef): Engine {
  engineDef = defaults(engineDef)
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
