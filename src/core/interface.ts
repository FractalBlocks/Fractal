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
}

export const makeInterfaceHelpers = (ctx: Context): InterfaceHelpers => ({
  ctx,
  interfaceOf: _interfaceOf(ctx),
  stateOf: _stateOf(ctx),
  ev: _ev(ctx),
  act: _act(ctx),
  vw: _vw(ctx),
  vws: _vws(ctx),
})

export interface CtxInterfaceOf {
  (name: string, interfaceName: string): any
}

// gets an interface message from a certain component
export const _interfaceOf = (ctx: Context) => (name: string, interfaceName) => {
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
    compCtx.interfaceValues[interfaceName] = compCtx.interfaces[interfaceName](compCtx.state)
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
    _evCtx('action', [actionName, context], param, options)
}

export interface CtxVw {
  (componentName: string): HandlerMsg
}

// extract component view interface, sintax sugar
export const _vw = (ctx: Context): CtxVw => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  return componentName => _interfaceOfCtx(componentName, 'view')
}

export interface CtxVws {
  (groupName: string): HandlerMsg[]
}

// extract view interfaces from a component group
export const _vws = (ctx: Context): CtxVws => {
  let _interfaceOfCtx = _interfaceOf(ctx)
  let comps = _componentHelpers(ctx)
  return groupName => {
    let views = []
    let componentNames = comps(groupName).getNames()
    for (let i = 0, len = componentNames.length; i < len; i++) {
      views.push(_interfaceOfCtx(componentNames[i], 'view'))
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

export function computeEvent(event: any, iData: InputData): EventData {
  let data

  if (iData[3] === '*') {
    // serialize the whole object (note that DOM events are not serializable, use paths instead)
    data = JSON.parse(JSON.stringify(event))
  } else if (event && iData[3] !== undefined) {
    // have fetch parameter
    if (iData[3] instanceof Array) {
      // fetch parameter is a path, e.g. ['target', 'value']
      let param = iData[3]
      if (param[1] && param[1] instanceof Array) {
        data = []
        for (let i = 0, len = param.length; i < len; i++) {
          data[i] = computePath(param[i], event)
        }
      } else {
        // only one path
        data = computePath(param, event)
      }
    } else {
      // fetch parameter is only a getter, e.g. 'target'
      data = event[iData[3]]
    }
  }
  if (iData[2] === undefined && iData[3] === undefined) {
    return [iData[0], iData[1]] // dispatch an input with no arguments
  }
  return [
    iData[0], // component id
    iData[1], // component event
    iData[2], // context argument
    data, // data
    iData[2] !== undefined && iData[3] !== undefined
      ? 'pair'
      : (iData[2] !== undefined)
      ? 'context'
      : 'fn',
  ]
}

// dispatch an input based on eventData to the respective component
/* istanbul ignore next */
// TODO: optimize via currification
export const dispatch = async (ctxIn: Context, eventData: EventData, isPropagated = true) => {
  let id = eventData[0] + ''
  // root component
  let ctx = ctxIn.components[(id + '').split('$')[0]]
  let compCtx = ctx.components[id]
  if (!compCtx) {
    return ctx.error('dispatch', `there are no component space '${id}'`)
  }
  let inputName = eventData[1]
  // extract data from eventData
  let data = eventData[4] === 'pair' // is both?
    ? [eventData[2], eventData[3]] // is both event data + context
    : eventData[4] === 'context'
    ? eventData[2] // is only context
    : eventData[3] // is only event data
  await toIt(compCtx)(inputName, data, isPropagated)
}
