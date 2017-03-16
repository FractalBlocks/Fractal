import {
  Action,
  Update,
  Component,
  Context,
  HandlerMsg,
  interfaceOf,
  Group,
} from '../core'

// set of helpers for building components

// generic action
export const action = (actions: { [name: string]: Action }): Update => ([arg1, arg2]) => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
  } else {
    name = arg1
    value = arg2
  }
  return actions[name](value) // generic action dispatcher
}

// extract view interface, sintax sugar
export function vw (ctx: Context, componentName: string): HandlerMsg {
  return interfaceOf(ctx, componentName, 'view')
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
