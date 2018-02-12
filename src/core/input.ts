import { Context } from './core'
import { CtxIn, _in, CtxAct, _act } from './interface'
import { getDescendantIds, getPath } from './index'
import {
  toIt,
  CtxToIt,
} from './module'

export interface InputHelpers {
  ctx: Context
  in: CtxIn
  act: CtxAct
  stateOf: CtxStateOf
  toIt: CtxToIt
  toChild: CtxToChild
  toChildAct: CtxToChildAct
  toAct: CtxToAct
  set: CtxSet
  task: CtxTask
  comps: CtxComponentHelpers
  _clearCache: CtxClearCache
}

export const makeInputHelpers = (ctx: Context): InputHelpers => ({
  ctx,
  in: _in(ctx),
  act: _act(ctx),
  stateOf: _stateOf(ctx),
  toIt: toIt(ctx),
  toChild: toChild(ctx),
  toChildAct: toChildAct(ctx),
  toAct: toAct(ctx),
  set: set(ctx),
  task: task(ctx),
  comps: _componentHelpers(ctx),
  _clearCache: _clearCache(ctx), // TODO:
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
  (childCompName: string, inputName: string, msg?, isPropagated?: boolean): void
}

// send a message to an input of a component from its parent
export const toChild = (ctx: Context) => async (
  childCompName,
  inputName,
  msg = undefined,
  isAsync = false,
  isPropagated = true
) => {
  let childId = ctx.id + '$' + childCompName
  let compCtx = ctx.components[childId]
  if (compCtx) {
    return await toIt(compCtx)(inputName, msg, isPropagated)
  } else {
    ctx.error('toChild', `there are no child '${childCompName}' in space '${ctx.id}'`)
  }
}

export interface CtxToChildAct {
  (childCompName: string, actionName: string, msg?, isPropagated?: boolean): void
}

// execute an action of a component from its parent
export const toChildAct = (ctx: Context) => async (
  childCompName,
  actionName,
  msg = undefined,
  isAsync = false,
  isPropagated = true
) => {
  let childId = ctx.id + '$' + childCompName
  let compCtx = ctx.components[childId]
  if (compCtx) {
    return await toIt(compCtx)('_action', [actionName, msg], isPropagated)
  } else {
    ctx.error('toChild', `there are no child '${childCompName}' in space '${ctx.id}'`)
  }
}

// ---

export interface CtxToAct {
  (actionName: string, data?: any, isPropagated?: boolean): Promise<any>
}

// generic action caller
export const toAct = (ctx: Context): CtxToAct => {
  let _toIt = toIt(ctx)
  return async (actionName, data, isPropagated = true) =>
    await _toIt('_action', [actionName, data], isPropagated)
}

export interface CtxSet {
  (variable: string, data?: any, isPropagated?: boolean): Promise<any>
}

// Set Action caller (syntax sugar)
export const set = (ctx: Context): CtxToAct => {
  let _toIt = toIt(ctx)
  return async (data, isPropagated = true) =>
    await _toIt('_action', ['Set', data], isPropagated)
}

export interface CtxTask {
  (taskName: string, data?: any, isPropagated?: boolean): Promise<any>
}

// generic action self caller
export const task = (ctx: Context): CtxTask => {
  let _toIt = toIt(ctx)
  return async (taskName, data, isPropagated = true) =>
    await _toIt('_execute', [taskName, ctx.id, data], isPropagated)
}

export interface CtxClearCache {
  (interfaceName: string, childNames?: string[]): void
}

// Clear interface cache
export const _clearCache = (ctx: Context): CtxClearCache => {
  return (interfaceName: string, childNames?: string[]) => {
    let descendantIds, childId
    if (childNames) {
      for (let i = 0, childName; childName = childNames[i]; i++) {
        childId = ctx.id + '$' + childName
        ctx.components[childId].interfaceValues[interfaceName] = undefined
        descendantIds = getDescendantIds(ctx, childId)
        for (let j = 0, descId; descId = descendantIds[j]; j++) {
          ctx.components[descId].interfaceValues[interfaceName] = undefined
        }
      }
    } else {
      ctx.components[ctx.id].interfaceValues[interfaceName] = undefined
      descendantIds = getDescendantIds(ctx, childId)
      for (let j = 0, descId; descId = descendantIds[j]; j++) {
        ctx.components[descId].interfaceValues[interfaceName] = undefined
      }
    }
  }
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
  getStates (options?: {
    path?: string[]
    exceptions?: string[]
    nameFn? (name: string): string
  }): any
  executeAll (insts: Instruction[]): void
  broadcast (inputName: string, data?: any): void
  optionalBroadcast (inputName: string, data?: any): void
  seqBroadcast (inputName: string, data?: any): Promise<any>
  seqOptionalBroadcast (inputName: string, data?: any): Promise<any>
  getNames (): string[]
  getCompleteNames (): string[]
}

export interface CtxComponentHelpers {
  (groupName: string): ComponentHelpers
}

export const getName = (name: string) => name.split('_')[1]

export const getCompleteNames = (state: any, groupName: string) =>
  Object.keys(state._nest)
    .filter(name => name.split('_')[0] === groupName)

export const getNames = (state: any, groupName: string) =>
  getCompleteNames(state, groupName)
    .map(n => n.split('_')[1])

export const _componentHelpers = (ctx: Context): CtxComponentHelpers => {
  let _toChild = toChild(ctx)
  let stateOf = _stateOf(ctx)
  return groupName => {
    let completeNames = Object.keys(ctx.components[ctx.id].state._nest)
      .filter(name => name.split('_')[0] === groupName)
    let componentNames = completeNames.map(n => n.split('_')[1])
    return {
      getState (key: string, options): any {
        let obj = {}
        let name
        let exceptions = options && options.exceptions
        let nameFn = options && options.nameFn
        for (let i = 0, len = completeNames.length; i < len; i++) {
          if (exceptions && exceptions.indexOf(componentNames[i]) === -1 || !exceptions) {
            name = componentNames[i]
            name = nameFn ? nameFn(name) : name
            obj[name] = stateOf(completeNames[i])[key]
          }
        }
        return obj
      },
      getStates (options): any {
        let obj = {}
        let name, state
        let exceptions = options && options.exceptions
        let path = options && options.path
        let nameFn = options && options.nameFn
        for (let i = 0, len = completeNames.length; i < len; i++) {
          if (exceptions && exceptions.indexOf(completeNames[i]) === -1 || !exceptions) {
            name = getName(completeNames[i])
            name = nameFn ? nameFn(name) : name
            state = stateOf(completeNames[i])
            obj[name] = path ? getPath(path, state) : state
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
        for (let i = 0, name; name = completeNames[i]; i++) {
          _toChild(name, inputName, data)
        }
      },
      optionalBroadcast (inputName, data) {
        for (let i = 0, name; name = completeNames[i]; i++) {
          if (ctx.components[ctx.id + '$' + name].inputs[inputName]) {
            _toChild(name, inputName, data)
          }
        }
      },
      async seqBroadcast (inputName, data) {
        for (let i = 0, name; name = completeNames[i]; i++) {
          await _toChild(name, inputName, data)
        }
      },
      async seqOptionalBroadcast (inputName, data) {
        for (let i = 0, name; name = completeNames[i]; i++) {
          if (ctx.components[ctx.id + '$' + name].inputs[inputName]) {
            await _toChild(name, inputName, data)
          }
        }
      },
      getNames() {
        return componentNames
      },
      getCompleteNames() {
        return completeNames
      }
    }
  }
}
