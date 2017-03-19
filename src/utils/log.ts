import { Context, EventData } from '../core'

// side effects for log functionality

export const warn = (source: string, description: string) => console.warn(`source: ${source}, description: ${description}`)

export const error = (source: string, description: string) => console.error(`source: ${source}, description: ${description}`)

export const onDispatch = (ctx: Context, ev: EventData) => {
  console.log(`dispatched input '${ev[1]}' from space '${ev[0]}' with parameters: '${ev[2]}' and '${ev[3]}'`)
  console.log(ctx.components[ev[0]].state)
}

export const logFns = {
  onDispatch,
  warn,
  error,
}
