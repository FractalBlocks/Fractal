import { ModuleDef, Model, Action, Update, Interface } from './core'
import { Stream, newStream } from '../src/stream'
import { InterfaceMsg } from './interface'

export interface Context {
  action$: Stream<Update<Model>>
}

export interface CtxInterface {
  (state: Model): InterfaceMsg
}

export interface Module {
  moduleDef: ModuleDef<any>
  name: string
  ctx: Context
  init(params: Model): Model
  interfaces: {
    [interfaceName: string]: CtxInterface
  }
}

export function merge(moduleDef: ModuleDef<Model>): Module {
  let ctx: Context = {
    action$: newStream<Update<Model>>(undefined)
  }
  let interfaces = {}
  for(let name in moduleDef.interfaces) {
    interfaces[name] = function(state) {
      return moduleDef.interfaces[name](ctx, moduleDef.actions, state)
    }
  }
  return {
    moduleDef,
    name: moduleDef.name,
    init: moduleDef.init,
    ctx,
    interfaces,
  }
}

