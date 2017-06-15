import {
  Actions,
  Update,
  Component,
  Context,
  Group,
  Module,
  toIt,
  StyleGroup,
  mergeStyles,
} from '../core'

// set of helpers for building components

// generic action input
export const action = (actions: Actions<any>) => ([arg1, arg2]: any): Update<any> => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
    if (arg2 !== undefined) {
      // add fetch value
      // TODO: test it!!
      value = (value !== undefined) ? [value, arg2]: arg2
    }
  } else {
    name = arg1
    value = arg2
  }
  return actions[name](value)
}

// send a message to an input of a component from outside a Module
/* istanbul ignore next */
export function sendMsg (mod: Module, id: string, inputName: string, msg?, isAsync = false, isPropagated = true) {
  let ctx = mod.ctx
  toIt(ctx.components[id].ctx)(inputName, msg, isAsync, isPropagated)
}

export function setGroup (name: string, group: Group) {
  return function (comp: Component<any>): Component<any> {
    comp.groups[name] = group
    return comp
  }
}

export function spaceOf (ctx: Context): any {
  return ctx.components[ctx.id]
}

// make a new component from another merging her state
export function props (state) {
  return function (comp: Component<any>): Component<any> {
    if (comp.state !== null && typeof comp.state === 'object'
    && state !== null && typeof state === 'object') {
      comp.state = Object.assign(comp.state, state)
    } else {
      comp.state = state
    }
    return comp
  }
}

export function styles (style: StyleGroup) {
  return function (comp: Component<any>): Component<any>{
    comp.groups.style = mergeStyles(comp.groups.style, style)
    return comp
  }
}
