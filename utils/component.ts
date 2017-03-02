import { Action, Update } from '../src'

// set of helpers for building components

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
