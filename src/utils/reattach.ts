import { ActionRecord } from '../core/core'
import { MiddleFn } from '../core/module'
import { toAct } from '../core/input'

export const hotSwap: MiddleFn = async (ctx, lastCtx) => {
  let records = lastCtx.global.records
  ctx.global = lastCtx.global
  ctx.global.records = []
  let record: ActionRecord
  let comp
  for (let i = 0, len = records.length; i < len; i++) {
    record = records[i]
    comp = ctx.components[record.id]
    if (comp) {
      await toAct(comp)(record.actionName, record.value)
    }
  }
}
