import {
  Component,
  Action,
  Update,
  Task,
  Context,
  ComponentSpace,
  ComponentIndex,
  Executable,
  EventData,
  DispatchData,
  EventFunction,
} from './core'
import {
  InterfaceHandler,
  InterfaceFunction,
  InterfaceMsg,
  InterfaceHandlerObject,
} from './interface'
import { newStream, Stream } from './stream'

export interface ModuleDef {
  log?: boolean
  logAll?: boolean
  root: Component
  interfaces: {
    [name: string]: InterfaceFunction
  }
}

export interface Module {
  moduleDef: ModuleDef
  reattach(root: Component): void
  dispose(): void
  isDisposed: boolean
  // related to internals
  interfaces: {
    [name: string]: InterfaceHandler
  }
  driverStreams: {
    [name: string]: Stream<InterfaceMsg>
  }
  // thing for testing (exposes wirings!!)
  ctx: Context
}

// API from module to handlers
export interface ModuleAPI {
  dispatch: {
    (dispatchData: DispatchData): void
  }
  merge: {
    (parentId: string, name: string, component: Component): void
  }
  mergeAll: {
    (parentId: string, components: { [name: string]: Component }): void
  }
}

// create context for a component
export function createContext (ctx: Context, name: string): Context {
  let id = `${ctx.id}$${name}`
  return {
    id,
    components: ctx.components,
    // delegation
    do: ctx.do,
    warn: ctx.warn,
    warnLog: ctx.warnLog,
    error: ctx.error,
    errorLog: ctx.errorLog,
  }
}

// gets the state from a certain component
export function stateOf (ctx, name) {
  return ctx.components[`${ctx.id}$${name}`].state
}

// gets an interface message from a certain component
export function interfaceOf (ctx: Context, name: string, interfaceName: string) {
  let componentSpace = ctx.components[`${ctx.id}$${name}`]
  return componentSpace.interfaces[interfaceName](ctx, componentSpace.state)
}

// add a module to the module index
export function merge (ctx: Context, name: string, component: Component) {
  let id = ctx.id + '$' + name // namespaced name
  if (ctx.components[id]) {
    ctx.warn('merge', `module '${ctx.id}' has overwritten module '${id}'`)
  }

  let childCtx = createContext(ctx, name)

  ctx.components[id] = {
    ctx: childCtx,
    state: component.state({key: name}),
    events: component.events(childCtx),
    interfaces: component.interfaces
  }
}

export function mergeAll (ctx: Context, components: { [name: string]: Component }) {
  // let space: ComponentSpace = { state: {}, events: {} }
  // ctx.components[parentId + '$' + name] = {} TODO: CRITICAL
}

// create an EventData array
export function ev (ctx: Context, inputName: string, paramFn?: EventFunction): EventData {
   return [ctx.id, inputName, paramFn]
}

// dispatch an event to the respective component
export const dispatch = (ctx: Context, dispatchData: DispatchData) => {
  let component = ctx.components[dispatchData[0]]
  if (!component) {
    return ctx.error('dispatch', `there are no module with id '${dispatchData[0]}'`)
  }
  let event = component.events[dispatchData[1]]
  if (event) {
    event(dispatchData[2])
  } else {
    ctx.error('dispatch', `there are no event with id '${dispatchData[1]}' in module '${dispatchData[0]}'`)
  }
}

// function for running a root component
export function run (moduleDefinition: ModuleDef): Module {
  // internal module state
  let driverStreams: { [driverName: string]: Stream<InterfaceMsg> } = {}
  // root component
  let component: Component
  let moduleDef
  // root context
  let ctx: Context
  let interfaces

  // attach root component
  function attach (state) {
    moduleDef = {
      log: false,
      logAll: false,
      ...moduleDefinition,
    }

    // root component
    component = moduleDef.root
    let rootName = component.name

    // root context
    ctx = {
      id: rootName,
      do: (executable: Executable) => execute(rootName, executable),
      // component index
      components: {},
      // error and warning handling
      warn: (source, description) => {
        ctx.warnLog.push([source, description])
        console.warn(`source: ${source}, description: ${description}`)
      },
      warnLog: [],
      error: (source, description) => {
        ctx.errorLog.push([source, description])
        console.error(`source: ${source}, description: ${description}`)
      },
      errorLog: [],
    }

    // pass DispatchFunction to every handler
    interfaces = {}
    // API for modules
    let moduleAPI: ModuleAPI = {
      // dispatch function type used for handlers
      dispatch: (dispatchData) => dispatch(ctx, dispatchData),
      // merge a component to the component index
      merge: (parentId, name, component) => merge(ctx, name, component),
      // merge many components to the component index
      mergeAll: (parentId, components) => mergeAll(ctx, components),
    }
    // TODO: optimize for (let in) with for (Object.keys())
    for (let name in moduleDef.interfaces) {
      interfaces[name] = moduleDef.interfaces[name](moduleAPI)
    }
    // inital state
    let newState = (state !== undefined) ? state : component.state({key: rootName})
    // reserve root space
    ctx.components[rootName] = {
      ctx,
      state: newState,
      events: component.events(ctx),
      interfaces,
    }

    // creates driverStreams
    for (let name in moduleDef.interfaces) {
      if (component.interfaces[name]) {
        driverStreams[name] = newStream(component.interfaces[name](ctx, ctx.components[rootName].state))
        // connect interface handlers to driver stream
        interfaces[name][(state == undefined) ? 'attach' : 'reattach'](driverStreams[name])
      } else {
        // TODO: document that drivers are renamed interface hanstatedlers
        console.warn(`'${rootName}' module has no interface called '${name}', unused interface handler`)
      }
    }

    function execute (componentId: string, executable: Executable | Executable[]) {
      let componentSpace = ctx.components[componentId]
      if (typeof executable === 'function') {
        // single update
        componentSpace.state = (<Update> executable)(componentSpace.state)
        notifyHandlers()
      } else if (executable instanceof Array) {
        if (executable[0] && typeof executable[0] === 'string') {
          // single task
          console.warn('unhandled task TODO-ENGINE')
        } else if (executable[0] instanceof Array) {
          // list of updates and tasks
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') {
              // is an update
              componentSpace.state = (<Update>executable[i])(componentSpace.state)
              notifyHandlers()
            } else if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
              // single task
              console.warn('unhandled task TODO-ENGINE')
              console.warn(executable[i])
            } else {
              console.warn('unrecognized executable at runtime')
            }
          }
        } else {
          console.warn('unrecognized executable at runtime')
        }
      }
    }

    function notifyHandlers () {
      for (let name in  driverStreams) {
        driverStreams[name].set(component.interfaces[name](ctx, ctx.components[rootName].state))
      }
    }

  }

  attach(undefined)

  function disposeDriverStreams () {
    for (var i = 0, keys = Object.keys(driverStreams); i < keys.length; i++) {
      driverStreams[keys[i]].dispose()
    }
  }

  return {
    moduleDef,
    // reattach root component, used for hot swaping
    reattach (comp: Component) {
      disposeDriverStreams()
      let lastComponents = ctx.components
      ctx.components = {}
      // TODO: use a deepmerge algoritm
      attach(lastComponents)
    },
    dispose () {
      // dispose all streams
      ctx.components = {}
      disposeDriverStreams()
      this.isDisposed = true
    },
    isDisposed: false,
    // related to internals
    interfaces,
    driverStreams,
    // root context
    ctx,
  }
}
