import { Stream, newStream } from './stream'
import { run } from './engine'
import { InterfaceMsg } from './interface'

export interface Module<T> {
  name: string
  log?: boolean
  logAll?: boolean
  init(params: { key: string }): T
  inputs?: Inputs<T>
  actions?: ActionsDef<T>
  interfaces: Interfaces<T>
}

export interface Interfaces<Model> {
  [interfaceName: string]: Interface<Model>
}

export interface Inputs<T> {
  [inputName: string]: Input<T>
}

export interface Input<T> {
  (ctx: Context): {
    (data: any): Update<T> | void | Task
  }
}

export interface ActionsDef<T> {
  [actionName: string]: Action<T>
}

export interface Action<T> {
  (data: any): Update<T>
}

export interface Task extends Array<any> {
  0: string // task name
  1: string // task function
  2: Object // task data
}

export interface Update<T> {
  (state: T): T
}

export interface Interface<T> {
  (ctx: Context, state: T): InterfaceMsg
}

export interface Context {
  do$: Stream<Executable | Executable[]>
  do: any
}

export type Executable = Update<any> | Task

export interface CtxInterface {
  state: InterfaceMsg
}

export default {
  run,
}
