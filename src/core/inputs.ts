import { Context } from './core'
import { CtxEv, ev } from './interface'
import { toIt, CtxToIt } from './module'

export interface InputHelpers {
  ctx: Context
  ev: CtxEv
  stateOf: CtxStateOf
  toIt: CtxToIt
  toChild: CtxToChild
  toAct: CtxToAct
}

export const makeInputHelpers = (ctx: Context) => ({
  ctx,
  ev: ev(ctx),
  stateOf: stateOf(ctx),
})


export interface CtxStateOf {
  (name?: string): any
}

export const stateOf = (ctx: Context): CtxStateOf => name => {
  let id = name ? ctx.id + '$' + name : ctx.id
  let space = ctx.components[id]
  if (space) {
    return space.state
  } else {
    ctx.error('stateOf',
      name
      ? `there are no child '${name}' in space '${ctx.id}'`
      : `there are no space '${id}'`
    )
  }
}

// --- Message interchange between components

export interface CtxToChild {
  (name: string, inputName: string, msg?, isPropagated?): void
}

// send a message to an input of a component from its parent
export const toChild = (ctx: Context) => (name, inputName, msg = undefined, isPropagated = true) => {
  let childId = ctx.id + '$' + name
  toIt(ctx.components[childId].ctx)(inputName, msg, isPropagated)
}

// ---

export interface CtxToAct {
  (actionName: string, data?: any, isPropagated?: boolean): void
}

// generic action self caller
export const toAct = (ctx: Context): CtxToAct => {
  let _toIt = toIt(ctx)
  return (actionName, data, isPropagated = true) =>
    _toIt('action', [actionName, data], isPropagated)
}

