import { ActionRecord } from '../core/core'
import { MiddleFn, Module } from '../core/module'
import { toAct } from '../core/input'

export const hotSwap: MiddleFn = async (ctx, app: Module) => {
  let records = app.rootCtx.global.records
  ctx.global.records = []
  ctx.global.render = false
  ctx.global.log = false
  let record: ActionRecord
  let comp
  for (let i = 0, len = records.length; i < len; i++) {
    record = records[i]
    comp = ctx.components[record.id]
    if (comp) {
      await toAct(comp)(record.actionName, record.value)
    }
  }
  ctx.global.render = true
  ctx.global.log = true
  app.rootCtx = ctx
}
