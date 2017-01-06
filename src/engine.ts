import { ModuleDef, Model, Action, Update } from './core'
import { merge, Context, Module } from './composition'
import { InterfaceHandler, InterfaceMsg } from './interface'
import { newStream, Stream } from './stream'

export interface EngineDef {
  log?: boolean
  logAll?: boolean
  module: ModuleDef<Model>
  interfaces?: {
    [name: string]: InterfaceHandler
  }
}

export interface Engine {
  engineDef: EngineDef
  reattach(module: ModuleDef<Model>): void
  dispose(): void
  isDisposed: boolean
  state$: Stream<Model>
  interfaces: {
    [name: string]: InterfaceHandler
  },
  driverStreams: {
    [name: string]: Stream<InterfaceMsg>
  }
}

export function run(engineDefinition: EngineDef): Engine {
  let engineDef = {
    log: false,
    logAll: false,
    ...engineDefinition,
  }
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
    for (let name in engineDef.interfaces) {
      if (moduleObj.def.interfaces[name]) {
        driverStreams[name] = newStream(moduleObj.def.interfaces[name](moduleObj.ctx, state$.get()))
        engineDef.interfaces[name][(state == undefined) ? 'attach' : 'reattach'](driverStreams[name])
      } else {
        // TODO: document that drivers are renamed interface handlers
        console.warn(`Root Module has no interface called ${name}, unused interface handler`)
      }
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
    dispose() {
      // dispose all streams
      ctx.do$.dispose()
      for (let name in driverStreams) {
        driverStreams[name].dispose()
      }
      for (let name in engineDef.interfaces) {
        if (engineDef.interfaces[name].state$) {
          engineDef.interfaces[name].state$.dispose()
        }
      }
      this.isDisposed = true
    },
    isDisposed: false,
    // related to internals
    state$,
    interfaces: engineDef.interfaces,
    driverStreams,
  }
}
