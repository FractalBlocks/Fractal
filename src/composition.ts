import { ModuleDef, Model, Action, Interface } from './core'
import { Stream, newStream } from '../src/stream'

export interface Context {

}

export interface Module {
  moduleDef: ModuleDef<any>
  ctx: {
    action$: Stream<Action<Model>>
  },
  interfaces: {
    [interfaceName: string]: Interface
  }
}

export function merge(moduleDef: ModuleDef<Model>): Module {
  let ctx = {
    action$: newStream<Action<Model>>(undefined)
  }
  return {
    moduleDef,
    ctx,
    interfaces: {},
  }
}

