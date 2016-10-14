import { ModuleDef, Model, Action } from './core'
import { merge, Context, Module } from './composition'
import { Driver, Drivers } from './driver'
import { newStream } from './stream'

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
  let ctx: Context, state$, driverStreams = {}, module: Module

  function attach() {
    module = merge(engineDef.module)
    ctx = module.ctx
    let state$ = newStream<Model>(module.init({key: module.name}))
    ctx.action$.subscribe(
      action => state$.set(action({}, state$.get()))
    )
  }

  attach()

  return {
    engineDef,
    reattach(m: ModuleDef<Model>) {},
    dispose() {},
  }
}
