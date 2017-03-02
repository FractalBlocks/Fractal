import { Action, Update, clone, Component } from '../src'

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

// make a new component from another merging her state
export function props (component: Component, state): Component {
  let comp = clone(component)
  comp.state = Object.assign(comp.state, state)
  return comp
}
