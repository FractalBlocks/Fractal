import { ModuleDef, Model, Action, Update, Interface, Task } from './core'
import { Stream, newStream } from '../src/stream'
import { InterfaceMsg } from './interface'

export interface Context {
  do$: Stream<Executable | Executable[]>
  do: any
}

type Executable = Update<Model> | Task

export interface CtxInterface {
  (state: Model): InterfaceMsg
}

export interface Module {
  def: ModuleDef<any>
  ctx: Context
}

export function merge(def: ModuleDef<Model>): Module {
  let do$ = newStream<Executable | Executable[]>(undefined)
  do$.set
  let ctx: Context = {
    do$,
    do: do$.set,
  }
  let interfaces = {}
  for(let name in def.interfaces) {
    interfaces[name] = function(state) {
      return def.interfaces[name](ctx, state)
    }
  }
  return {
    def,
    ctx,
  }
}

