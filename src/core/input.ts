import { Context } from './core'
import { CtxEv, ev } from './interface'
import {
  toIt,
  CtxToIt,
  CtxNest,
  CtxUnnestAll,
  CtxNestAll,
  CtxUnnest,
  nest,
  unnest,
  nestAll,
  unnestAll,
} from './module'

export interface InputHelpers {
  ctx: Context
  ev: CtxEv
  stateOf: CtxStateOf
  toIt: CtxToIt
  toChild: CtxToChild
  toAct: CtxToAct
  nest: CtxNest
  unnest: CtxUnnest
  nestAll: CtxNestAll
  unnestAll: CtxUnnestAll
}

export const makeInputHelpers = (ctx: Context): InputHelpers => ({
  ctx,
  ev: ev(ctx),
  stateOf: stateOf(ctx),
  toIt: toIt(ctx),
  toChild: toChild(ctx),
  toAct: toAct(ctx),
  nest: nest(ctx),
  unnest: unnest(ctx),
  nestAll: nestAll(ctx),
  unnestAll: unnestAll(ctx),
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
  (name: string, inputName: string, msg?, isAsync?: boolean, isPropagated?: boolean): void
}

// send a message to an input of a component from its parent
export const toChild = (ctx: Context) => (
  name,
  inputName,
  msg = undefined,
  isAsync = false,
  isPropagated = true
) => {
  let childId = ctx.id + '$' + name
  let space = ctx.components[childId]
  if (space) {
    toIt(space.ctx)(inputName, msg, isAsync, isPropagated)
  } else {
    ctx.error('toChild', `there are no child '${name}' in space '${ctx.id}'`)
  }
}

// ---

export interface CtxToAct {
  (actionName: string, data?: any, isAsync?: boolean, isPropagated?: boolean): void
}

// generic action self caller
export const toAct = (ctx: Context): CtxToAct => {
  let _toIt = toIt(ctx)
  return (actionName, data, isAsync = false, isPropagated = true) =>
    _toIt('action', [actionName, data], isAsync, isPropagated)
}
