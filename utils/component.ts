import { Action, Update, clone, Component, Context, HandlerMsg, interfaceOf } from '../src'

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

// make a new component from another merging her state
export function props (component: Component, state): Component {
  let comp: Component = clone(component)
  if (comp.state !== null && typeof comp.state === 'object'
   && state !== null && typeof state === 'object') {
    comp.state = Object.assign(comp.state, state)
  } else {
    comp.state = state
  }
  return comp
}
