import { ModuleDef, Model, Action, Update } from './core'
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

export function run(engineDef: EngineDef): Engine {
  let defaults = {
    log: false,
    logAll: false,
  }
  engineDef = Object.assign(defaults, engineDef)
  let ctx: Context, state$,
   driverStreams: { [driverName: string]: Stream<InterfaceMsg> } = {},
   moduleObj: Module

  function attach(state: Model | undefined) {
    // ModuleDef -> Module
    moduleObj = merge(engineDef.module)
    ctx = moduleObj.ctx
    // action$ --> state$
    let state$ = newStream<Model>(moduleObj.def.init({key: moduleObj.def.name}))
    ctx.do$.subscribe(
      executable => {
        if (typeof executable === 'function') {
          // single update
          state$.set((<Update<Model>>executable)(state$.get()))
        } else if (executable instanceof Array) {
          if (executable[0] && typeof executable[0] === 'string') {
            // single task
            console.log('unhandled task TODO-ENGINE'); console.log(executable)
          } else if (executable[0] instanceof Array) {
            // list of updates and tasks
            for (let i = 0, len = executable.length; i < len; i++) {
              if (typeof executable[i] === 'function') {
                // is an update
                state$.set((<Update<Model>>executable[i])(state$.get()))
              } else if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
                // single task
                console.log('unhandled task TODO-ENGINE'); console.log(executable[i])
              } else {
                console.warn('unrecognized executable at runtime')
              }
            }
          } else {
            console.warn('unrecognized executable at runtime')
          }
        }
      }
    )
    // creates driverStreams
    for (let name in moduleObj.def.interfaces) {
      driverStreams[name] = newStream(moduleObj.def.interfaces[name](moduleObj.ctx, state$.get()))
      engineDef.interfaces[name][(state == undefined) ? 'attach' : 'reattach'](driverStreams[name])
    }
    // state$ --> driverStreams
    for (let name in  driverStreams) {
      state$.subscribe(
        state => driverStreams[name].set(moduleObj.def.interfaces[name](moduleObj.ctx, state))
      )
    }
  }

  attach(undefined)

  return {
    engineDef,
    reattach(m: ModuleDef<Model>) {},
    dispose() {},
  }
}
