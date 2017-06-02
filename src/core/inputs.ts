import { Context } from './core'
import { CtxEv, ev } from './interface'

export interface InputHelpers {
  ctx: Context
  ev: CtxEv
}

export const makeInputHelpers = (ctx: Context) => ({
  ctx,
  ev: ev(ctx),
})
