import {
  Action,
  Update,
  Component,
  Context,
  InputData,
  HandlerMsg,
  interfaceOf,
  Group,
  ev,
  execute,
  Module,
  Executable,
} from '../core'

// set of helpers for building components

// generic action
export const action = (actions: { [name: string]: Action }): Update => ([arg1, arg2]) => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
    if (arg2 !== undefined) {
      // add fetch value
      value = [value, arg2]
    }
  } else {
    name = arg1
    value = arg2
  }
  return actions[name](value) // generic action dispatcher
}

// generic action dispatcher
export const act = (ctx: Context, context?: any, param?: any): InputData => {
  return ev(ctx, 'action', context, param)
}

// extract view interface, sintax sugar
export function vw (ctx: Context, componentName: string): HandlerMsg {
  return interfaceOf(ctx, componentName, 'view')
}

// send a message to an input of a component from outside a Module
export function sendMsg (mod: Module, id, inputName, msg) {
  let ctx = mod.ctx
  let inputResult = <Executable | Executable[]> ctx.components[id].inputs[inputName](msg)
  execute(ctx, id, inputResult)
}

// send a message to an input of a component from its parent
export function toChild (ctx: Context, name, inputName, msg) {
  let childId = ctx.id + '$' + name
  let inputResult = <Executable | Executable[]> ctx.components[childId].inputs[inputName](msg)
  execute(ctx, childId, inputResult)
}

// -- Functions for manipulating components

// pipe allows to pipe functions (left composing)
export function pipe (...args) {
  return function (value) {
    let result = value
    for (let i = 0, len = args.length; i < len; i++) {
      result = args[i](result)
    }
    return result
  }
}

// make a new component from another merging her state
export function props (state) {
  return function (comp: Component): Component {
    if (comp.state !== null && typeof comp.state === 'object'
    && state !== null && typeof state === 'object') {
      comp.state = Object.assign(comp.state, state)
    } else {
      comp.state = state
    }
    return comp
  }
}

export function setGroup (name: string, group: Group) {
  return function (comp: Component): Component {
    comp.groups[name] = group
    return comp
  }
}

export interface KeyValuePair extends Array<any> {
  0: string
  1: any
}

export function mapToObj (arr: any[], fn: { (idx, value?): KeyValuePair } ): any {
  let result = {}, aux
  for (let i = 0, len = arr.length; i < len; i++) {
    aux = fn(i, arr[i])
    result[aux[0]] = aux[1]
  }
  return result
}

export function stateOf (ctx: Context): any {
  return ctx.components[ctx.id].state
}

export function spaceOf (ctx: Context): any {
  return ctx.components[ctx.id]
}
