import { ModuleDef, Model, Action, Interface } from './core'
import { Stream, newStream } from '../src/stream'

export interface Context {
  action$: Stream<Action<Model>>
}

export interface Module {
  moduleDef: ModuleDef<any>
  name: string
  ctx: Context
  init(params: Model): Model
  interfaces: {
    [interfaceName: string]: Interface
  }
}

export function merge(moduleDef: ModuleDef<Model>): Module {
  let ctx: Context = {
    action$: newStream<Action<Model>>(undefined)
  }
  return {
    moduleDef,
    name: moduleDef.name,
    init: moduleDef.init,
    ctx,
    interfaces: {},
  }
}

