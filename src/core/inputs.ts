import { Context } from './core'
import { CtxEv, ev } from './interface'

export interface InputHelpers {
  ctx: Context
  ev: CtxEv
  stateOf: CtxStateOf
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
