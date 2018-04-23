import { Context, InterfaceHelpers, CtxPerformTask, EventData, dispatchEv, State } from '.'
import { Emit, Off, Descriptor } from 'pullable-event-bus'
import { _in, _act, _actFn, _inFn } from './interface'
import { getDescendantIds, getPath } from './index'
import {
  toIn,
  CtxToIn,
  performTask,
} from './module'

export interface FractalOn {
  (evName: string, evData: EventData, pullable?: boolean): Descriptor
}

export interface InputHelpers<S> extends InterfaceHelpers<S> {
  state: S
  toIn: CtxToIn
  toChild: CtxToChild
  toChildAct: CtxToChildAct
  toAct: CtxToAct
  set: CtxSet
  task: CtxPerformTask
  emit: Emit
  on: FractalOn
  off: Off
  comps: CtxComponentHelpers
  _clearCache: CtxClearCache
}

export const makeInputHelpers = <S extends State>(ctx: Context<S>): InputHelpers<S> => ({
  state: makeImmutableState(ctx, ctx.state),
  ctx,
  in: _in(ctx),
  act: _act(ctx),
  inFn: _inFn(ctx),
  actFn: _actFn(ctx),
  stateOf: _stateOf(ctx),
  toIn: toIn(ctx),
  toChild: toChild(ctx),
  toChildAct: toChildAct(ctx),
  toAct: toAct(ctx),
  set: set(ctx),
  task: performTask(ctx),
  emit: ctx.eventBus.emit,
  on: (evName, evData, pullable) => {
    const _dispatchEv = dispatchEv(ctx)
    return ctx.eventBus.on(evName, data => _dispatchEv(data, evData), pullable)
  },
  off: ctx.eventBus.off,
  comps: _componentHelpers(ctx),
  _clearCache: _clearCache(ctx),
})

const disallowMutation = <S>(ctx: Context<S>) => {
  ctx.error('Cannot Mutate the State here', 'State mutations are not allowed inside inputs')
  return false
}

const makeImmutableState = <S>(ctx: Context<S>, s: S): S => new Proxy(<any> s, {
  set: disallowMutation,
  deleteProperty: disallowMutation,
  defineProperty: disallowMutation,
})

export interface CtxStateOf {
  (name?: string): State
}

export const _stateOf = <S extends State>(ctx: Context<S>): CtxStateOf => name => {
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
  (childCompName: string, inputName: string, msg?): void
}

// send a message to an input of a component from its parent
export const toChild = <S>(ctx: Context<S>) => async (
  childCompName,
  inputName,
  msg = undefined
) => {
  let childId = ctx.id + '$' + childCompName
  let compCtx = ctx.components[childId]
  if (compCtx) {
    return await toIn(compCtx)(inputName, msg)
  } else {
    ctx.error('toChild', `there are no child '${childCompName}' in space '${ctx.id}'`)
  }
}

export interface CtxToChildAct {
  (childCompName: string, actionName: string, msg?): void
}

// execute an action of a component from its parent
export const toChildAct = <S>(ctx: Context<S>) => async (
  childCompName,
  actionName,
  msg = undefined
) => {
  let childId = ctx.id + '$' + childCompName
  let compCtx = ctx.components[childId]
  if (compCtx) {
    return await toIn(compCtx)('_action', [actionName, msg])
  } else {
    ctx.error('toChild', `there are no child '${childCompName}' in space '${ctx.id}'`)
  }
}

// ---

export interface CtxToAct {
  (actionName: string, data?: any): Promise<any>
}

// generic action caller
export const toAct = <S>(ctx: Context<S>): CtxToAct => {
  let _toIn = toIn(ctx)
  return async (actionName, data) =>
    await _toIn('_action', [actionName, data])
}

export interface CtxSet {
  (arg0: any, arg1?: any): Promise<any>
}

// Set Action caller (syntax sugar)
export const set = <S>(ctx: Context<S>): CtxSet => {
  let _toIn = toIn(ctx)
  return async (arg0, arg1) =>
    await _toIn('_action', ['Set', arg0 instanceof Array ? arg0 : [arg0, arg1]])
}

export type SubscriptionInfo = Descriptor

export interface CtxClearCache {
  (interfaceName: string, childNames?: string[]): void
}

/**
 * Clears the interface cache of a component and its descendants
 * @param ctx The component Context
 */
export const _clearCache = <S>(ctx: Context<S>): CtxClearCache => {
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

// --- Child component helpers: functions for traversing and broadcasting messages to child components

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

export const _componentHelpers = <S extends State>(ctx: Context<S>): CtxComponentHelpers => {
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
