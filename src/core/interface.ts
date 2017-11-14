import {
  Context,
  InputData,
  EventOptions,
  EventData,
} from './core'
import {
  HandlerMsg,
} from './handler'
import { toIt } from './module'
import { _stateOf, CtxStateOf, _componentHelpers } from './input'

export interface InterfaceHelpers {
  ctx: Context
  interfaceOf: CtxInterfaceOf
  stateOf: CtxStateOf
  ev: CtxEv
  act: CtxAct
  vw: CtxVw
  vws: CtxVws
  group: CtxGroup
}

export const makeInterfaceHelpers = (ctx: Context): InterfaceHelpers => ({
  ctx,
  interfaceOf: _interfaceOf(ctx),
  stateOf: _stateOf(ctx),
  ev: _ev(ctx),
  act: _act(ctx),
  vw: _vw(ctx),
  vws: _vws(ctx),
  group: _group(ctx),
})

export interface CtxInterfaceOf {
  (name: string, interfaceName: string): Promise<any>
}

// gets an interface message from a certain component
export const _interfaceOf = (ctx: Context) => async (name: string, interfaceName) => {
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
    compCtx.interfaceValues[interfaceName] = await compCtx.interfaces[interfaceName](compCtx.state)
    return compCtx.interfaceValues[interfaceName]
  }
}

export interface CtxAct {
  (actionName: string, context?: any, param?: any, options?: EventOptions): InputData
}

// generic action dispatcher
export const _act = (ctx: Context): CtxAct => {
  let _evCtx = _ev(ctx)
  return (actionName, context, param, options): InputData =>
    _evCtx('_action', [actionName, context], param, options)
}

export interface CtxVw {
  (componentName: string): Promise<HandlerMsg>
}

// extract component view interface, sintax sugar
export const _vw = (ctx: Context): CtxVw => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  return async componentName => await _interfaceOfCtx(componentName, 'view')
}

export interface CtxVws {
  (names: string[]): Promise<HandlerMsg[]>
}

// extract view interfaces from a component group
export const _vws = (ctx: Context): CtxVws => {
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
export const _group = (ctx: Context): CtxGroup => {
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

export interface CtxEv {
  (inputName: string, context?: any, param?: any, options?: EventOptions): InputData
}

// create an InputData array
export const _ev = (ctx: Context): CtxEv => (inputName, context, param, options) => {
  return [ctx.id, inputName, context, param, options]
}

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

export const dispatchEv = (ctx: Context) => async (event: any, iData: InputData) => {
  let compCtx = ctx.components[iData[0] + '']
  let cInputData = computeEvent(event, iData)
  await toIt(compCtx)(cInputData[1], cInputData[2])
}

export const toComp = (ctx: Context) => async (id: string, inputName: string, data: any, isPropagated = true) => {
  let compCtx = ctx.components[id]
  await toIt(compCtx)(inputName, data, isPropagated)
}
