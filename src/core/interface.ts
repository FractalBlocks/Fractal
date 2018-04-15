import {
  Context,
  InputData,
  EventOptions,
  EventData,
  State,
} from './core'
import {
  HandlerMsg,
} from './handler'
import { toIn } from './module'
import { _stateOf, _componentHelpers, CtxStateOf } from './input'

export interface InterfaceHelpers<S> {
  ctx: Context<S>
  interfaceOf?: CtxInterfaceOf
  stateOf: CtxStateOf
  in: CtxIn
  act: CtxAct
  vw?: CtxVw
  vws?: CtxVws
  group?: CtxGroup
}

export const makeInterfaceHelpers = <S extends State>(ctx: Context<S>): InterfaceHelpers<S> => ({
  ctx,
  interfaceOf: _interfaceOf(ctx),
  stateOf: _stateOf(ctx),
  in: _in(ctx),
  act: _act(ctx),
  vw: _vw(ctx),
  vws: _vws(ctx),
  group: _group(ctx),
})

export interface CtxInterfaceOf {
  (name: string, interfaceName: string): Promise<any>
}

// gets an interface message from a certain component
export const _interfaceOf = <S>(ctx: Context<S>) => async (name: string, interfaceName) => {
  let id = `${ctx.id}$${name}`
  let compCtx = ctx.components[id]
  if (!compCtx) {
    ctx.error('interfaceOf', `there are no component space '${id}'`)
    return {}
  }
  if (!compCtx.interfaces[interfaceName]) {
    ctx.error(
      'interfaceOf',
      `there are no interface '${interfaceName}' in component '${compCtx.name}' from space '${id}'`
    )
    return {}
  }
  // search in interface cache
  let cache = compCtx.interfaceValues[interfaceName]
  if (cache) {
    return cache
  } else {
    // caches interface
    compCtx.interfaceValues[interfaceName]
      = await compCtx.interfaces[interfaceName](compCtx.state, compCtx.interfaceHelpers)
    return compCtx.interfaceValues[interfaceName]
  }
}

export interface CtxIn {
  (inputName: string, context?: any, param?: any, options?: EventOptions): InputData
}

// create an InputData array
export const _in = <S>(ctx: Context<S>): CtxIn => (inputName, context, param, options) => {
  return [ctx.id, inputName, context, param, options]
}

export interface CtxAct {
  (actionName: string, context?: any, param?: any, options?: EventOptions): InputData
}

// generic action dispatcher
export const _act = <S>(ctx: Context<S>): CtxAct => {
  let _inCtx = _in(ctx)
  return (actionName, context, param, options): InputData =>
    _inCtx('_action', [actionName, context], param, options)
}

export interface CtxVw {
  (componentName: string): Promise<HandlerMsg>
}

// extract component view interface, sintax sugar
export const _vw = <S>(ctx: Context<S>): CtxVw => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  return async componentName => await _interfaceOfCtx(componentName, 'view')
}

export interface CtxVws {
  (names: string[]): Promise<HandlerMsg[]>
}

// extract view interfaces based on component names
export const _vws = <S>(ctx: Context<S>): CtxVws => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  return async names => {
    let views = []
    for (let i = 0, len = names.length; i < len; i++) {
      views.push(await _interfaceOfCtx(names[i], 'view'))
    }
    return views
  }
}

export interface CtxGroup {
  (groupName: string): Promise<HandlerMsg[]>
}

// extract view interfaces from a component group
export const _group = <S extends State>(ctx: Context<S>): CtxGroup => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  let comps = _componentHelpers(ctx)
  return async groupName => {
    let views = []
    let componentNames = comps(groupName).getCompleteNames()
    for (let i = 0, len = componentNames.length; i < len; i++) {
      views.push(await _interfaceOfCtx(componentNames[i], 'view'))
    }
    return views
  }
}

/**
 * Extract a path or some paths from an Event Object
 * @param path An array that contains an object path
 * @param event An Event Object
 */
function computePath (path: any[], event) {
  let data
  let actual = event
  for (let i = 0, len = path.length; i < len; i++) {
    if (path[i] instanceof Array) {
      data = {}
      let keys = path[i]
      for (let i = 0, len = keys.length; i < len; i++) {
        data[keys[i]] = actual[keys[i]]
      }
    } else {
      actual = actual[path[i]]
    }
  }
  if (!data) {
    data = actual
  }
  return data
}

export function computeEvent(eventData: any, iData: InputData): EventData {
  let data
  let haveContext = iData[2] !== undefined
  let haveParam = iData[3] !== undefined

  if (iData[3] === '*') {
    // serialize the whole object (note that DOM events are not serializable, use paths instead)
    data = JSON.parse(JSON.stringify(eventData))
  } else if (iData[3] !== undefined) {
    // have fetch parameter
    if (iData[3] instanceof Array) {
      // fetch parameter is a path, e.g. ['target', 'value']
      let param = iData[3]
      if (param[1] && param[1] instanceof Array) {
        data = []
        for (let i = 0, len = param.length; i < len; i++) {
          data[i] = computePath(param[i], eventData)
        }
      } else {
        // only one path
        data = computePath(param, eventData)
      }
    } else {
      // fetch parameter is only a getter, e.g. 'target'
      data = eventData[iData[3]]
    }
  }
  if (!haveContext && !haveParam) {
    return [iData[0], iData[1]] // dispatch an input with no arguments
  }
  return [
    iData[0], // component id
    iData[1], // component input name
    haveContext && haveParam
      ? [iData[2], data]
      : haveParam
      ? data
      : iData[2]
  ]
}

export const dispatchEv = <S>(ctx: Context<S>) => async (event: any, iData: InputData) => {
  let compCtx = ctx.components[iData[0] + '']
  if (!compCtx) {
    ctx.error('Dispatch Event (dispatchEv)', `There is no component with id: ${iData[0]}`)
    return
  }
  let cInputData = computeEvent(event, iData)
  return await toIn(compCtx)(cInputData[1], cInputData[2])
}

/**
 * Executes an input of aa certain component, passing to some data to him
 */
export interface CtxToComp {
  (id: string, inputName: string, data?: any): any
}

/**
 * toComp function factory
 * @param ctx
 * @returns CtxToComp
 */
export const toComp = <S>(ctx: Context<S>): CtxToComp => async (id: string, inputName: string, data?: any) => {
  let compCtx = ctx.components[id]
  if (!compCtx) {
    ctx.error('Execute component input (toComp)', `There is no component with id: ${id}`)
    return
  }
  return await toIn(compCtx)(inputName, data)
}
