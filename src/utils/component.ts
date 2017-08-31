import {
  Component,
  Context,
  Group,
  Module,
  toIt,
  StyleGroup,
  mergeStyles,
} from '../core'

// set of helpers for building components

// send a message to an input of a component from outside a Module
/* istanbul ignore next */
export async function sendMsg (mod: Module, id: string, inputName: string, msg?, isPropagated = true) {
  let ctx = mod.ctx
  await toIt(ctx.components[id].ctx)(inputName, msg, isPropagated)
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

export const compGroup = (groupName: string, arr: any[][], fn: any) => arr.reduce(
  (comps, c) => {
    comps[groupName + '_' + c[0]] = fn(c[1])
    return comps
  }
, {})
