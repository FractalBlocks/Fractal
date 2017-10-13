import { Context } from './core'
import { CtxEv, _ev, CtxAct, _act } from './interface'
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
  act: CtxAct
  stateOf: CtxStateOf
  toIt: CtxToIt
  toChild: CtxToChild
  toAct: CtxToAct
  runIt: CtxRunIt
  nest: CtxNest
  unnest: CtxUnnest
  nestAll: CtxNestAll
  unnestAll: CtxUnnestAll
  comps: CtxComponentHelpers
}

export const makeInputHelpers = (ctx: Context): InputHelpers => ({
  ctx,
  ev: _ev(ctx),
  act: _act(ctx),
  stateOf: _stateOf(ctx),
  toIt: toIt(ctx),
  toChild: toChild(ctx),
  toAct: toAct(ctx),
  runIt: runIt(ctx),
  nest: nest(ctx),
  unnest: unnest(ctx),
  nestAll: nestAll(ctx),
  unnestAll: unnestAll(ctx),
  comps: _componentHelpers(ctx),
})

export interface CtxStateOf {
  (name?: string): any
}

export const _stateOf = (ctx: Context): CtxStateOf => name => {
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
  (name: string, inputName: string, msg?, isPropagated?: boolean): void
}

// send a message to an input of a component from its parent
export const toChild = (ctx: Context) => async (
  name,
  inputName,
  msg = undefined,
  isAsync = false,
  isPropagated = true
) => {
  let childId = ctx.id + '$' + name
  let compCtx = ctx.components[childId]
  if (compCtx) {
    await toIt(compCtx)(inputName, msg, isPropagated)
  } else {
    ctx.error('toChild', `there are no child '${name}' in space '${ctx.id}'`)
  }
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

export interface CtxRunIt {
  (executables: Promise<void>, isPropagated?: boolean): void
}

// generic action self caller
export const runIt = (ctx: Context): CtxRunIt => {
  let _toIt = toIt(ctx)
  return (executables, isPropagated = true) =>
    _toIt('return', executables, isPropagated)
}

// --- Child components helpers: build functions for traversing components and broadcasting messages to them

export interface Instruction extends Array<any> {
  0: string // component name
  1: string // input
  2: any // data
}

export interface ComponentHelpers {
  getState (key: string, options?: {
    exceptions?: string[]
    nameFn? (name: string): string
  }): any
  executeAll (insts: Instruction[]): void
  broadcast (inputName: string, data?: any)
  getNames (): string[]
}

export interface CtxComponentHelpers {
  (groupName: string): ComponentHelpers
}

export const getName = (name: string) => name.split('_')[1]

export const _componentHelpers = (ctx: Context): CtxComponentHelpers => {
  let _toChild = toChild(ctx)
  let stateOf = _stateOf(ctx)
  return groupName => {
    let componentNames = Object.keys(ctx.components[ctx.id].components)
      .filter(name => name.split('_')[0] === groupName)
    return {
      getState (key: string, options): any {
        let obj = {}
        let name
        let exceptions = options && options.exceptions
        let nameFn = options && options.nameFn
        for (let i = 0, len = componentNames.length; i < len; i++) {
          if (exceptions && exceptions.indexOf(componentNames[i]) === -1 || !exceptions) {
            name = getName(componentNames[i])
            name = nameFn ? nameFn(name) : name
            obj[name] = stateOf(componentNames[i])[key]
          }
        }
        return obj
      },
      executeAll (insts) {
        for (let i = 0, inst; inst = insts[i]; i++) {
          _toChild(groupName + '_' + inst[0], inst[1], inst[2])
        }
      },
      broadcast (inputName, data) {
        for (let i = 0, name; name = componentNames[i]; i++) {
          _toChild(name, inputName, data)
        }
      },
      getNames() {
        return componentNames
      }
    }
  }
}
