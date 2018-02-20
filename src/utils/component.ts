import {
  Component,
  Context,
  Group,
  Module,
  toIt,
  StyleGroup,
  mergeStyles,
  clone,
} from '../core'

// set of helpers for building components

// send a message to an input of a component from outside a Module
/* istanbul ignore next */
export async function sendMsg (mod: Module, id: string, inputName: string, msg?) {
  let ctx = mod.rootCtx
  await toIt(ctx.components[id])(inputName, msg)
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
    let newComp = Object.assign({}, comp) // shallow clone
    newComp.state = clone(Object.assign(comp.state, state))
    return newComp
  }
}

export function styles (style: StyleGroup) {
  return function (comp: Component<any>): Component<any>{
    let newComp = Object.assign({}, comp) // shallow clone
    newComp.groups.style = clone(mergeStyles(comp.groups.style, style))
    return newComp
  }
}

export const compGroup = (groupName: string, arr: any[][], fn: any) => arr.reduce(
  (comps, c) => {
    comps[groupName + '_' + c[0]] = fn(c[1])
    return comps
  }
, {})

/**
 * Get the component descendants ids
 * @param ctx Any Context
 * @param id The component id
 */
export const getDescendantIds = (ctx: Context, id: string): string[] => {
  let searchStr = id + '$'
  return Object.keys(ctx.components).filter(compId => compId.includes(searchStr))
}

/**
 * Get the context of the parent of a component
 * @param ctx The component context
 */
export const getParentCtx = (ctx: Context) => ctx.components[(ctx.id + '').split('$').slice(0, -1).join('$')]

export interface CompOptions {
  state?: any
  style?: StyleGroup,
}

/**
 * Function for concateniting properties to a component, makes a copy fisrt
 * @param component The target component
 * @param options Options to concatenate
 */
export const comp = (component: Component<any>, options: CompOptions) => {
  const newComp = clone(component)
  if (options.state) {
    newComp.state = Object.assign(newComp.state, options.state)
  }
  if (options.style) {
    newComp.groups.style = mergeStyles(newComp.groups.style, options.style)
  }
  return newComp
}
