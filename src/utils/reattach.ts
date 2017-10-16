import { ActionRecord } from '../core/core'
import { MiddleFn } from '../core/module'
import { toAct } from '../core/input'

export const hotSwap: MiddleFn = async (ctx, lastCtx) => {
  let records = lastCtx.global.records
  console.log(records)
  let record: ActionRecord
  for (let i = 0, len = records.length; i < len; i++) {
    record = records[i]
    await toAct(ctx.components[record.id])(record.actionName, record.value)
  }
}
