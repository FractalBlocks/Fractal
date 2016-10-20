import { ModuleDef, Model, Action } from './core'
import { merge, Context, Module } from './composition'
import { InterfaceDriver, InterfaceMsg } from './interface'
import { newStream, Stream } from './stream'

export interface EngineDef {
  log?: boolean
  logAll?: boolean
  module: ModuleDef<Model>
  interfaces?: {
    [interfaceDriverName: string]: InterfaceDriver
  }
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
  let ctx: Context, state$,
   driverStreams: { [driverName: string]: Stream<InterfaceMsg> } = {},
   module: Module

  function attach(state: Model | undefined) {
    // ModuleDef -> Module
    module = merge(engineDef.module)
    ctx = module.ctx
    // action$ --> state$
    let state$ = newStream<Model>(module.init({key: module.name}))
    ctx.action$.subscribe(
      action => state$.set(action(state$.get()))
    )
    // state$ --> driverStreams
    for(let driverName in module.interfaces) {
      driverStreams[driverName] = newStream(module.interfaces[driverName](state$.get()))
      engineDef.interfaces[driverName][(state == undefined) ? 'attach' : 'reattach'](driverStreams[driverName])
    }
  }

  attach(undefined)

  return {
    engineDef,
    reattach(m: ModuleDef<Model>) {},
    dispose() {},
  }
}
