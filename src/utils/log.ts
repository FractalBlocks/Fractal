import { clone, _stateOf, Context } from '../core'

export const warn = async (source: string, description: string) =>
  console.warn(`source: ${source}, description: ${description}`)

export const error = (source: string, description: string) => {
  throw `source: ${source}, description: ${description}`
}

export const beforeInput = (ctx: Context, inputName, data) => {
  if (!ctx.global.log) return
  let state = _stateOf(ctx)()
  if (typeof state === 'object') {
    state = clone(state)
  }
  console.groupCollapsed(
    `%c input %c${inputName} %cfrom %c${ctx.id}`,
    'color: #626060; font-size: 12px;',
    'color: #3b3a3a; font-size: 14px;',
    'color: #626060; font-size: 12px;',
    'color: #3b3a3a; font-size: 14px;'
  )
  console.info('%c input data  ', 'color: rgb(9, 157, 225); font-weight: bold;', data)
  console.info('%c prev state  ', 'color: #AFAFAF; font-weight: bold;', state)
}

// color for actions (not yet implemented) #58C6F8

export const afterInput = (ctx: Context, inputName, data) => {
  if (!ctx.global.log) return
  let state = _stateOf(ctx)()
  if (typeof state === 'object') {
    state = clone(state)
  }
  console.info('%c next state  ', 'color: #3CA43F; font-weight: bold;', state)
  console.groupEnd()
}

export const logFns = {
  warn,
  error,
  beforeInput,
  afterInput,
}
