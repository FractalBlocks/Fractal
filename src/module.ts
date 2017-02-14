import {
  Component,
  Action,
  Update,
  Context,
  ComponentSpace,
  ComponentIndex,
  Executable,
  EventData,
  DispatchData,
  EventFunction,
  Interface,
} from './core'
import {
  InterfaceHandler,
  InterfaceFunction,
  InterfaceMsg,
  InterfaceHandlerObject,
} from './interface'
import { Task, TaskFunction } from './task'
import { newStream, Stream } from './stream'

export interface ModuleDef {
  log?: boolean
  logAll?: boolean
  root: Component
  tasks?: {
    [name: string]: TaskFunction
  }
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
    [name: string]: InterfaceHandlerObject
  }
  interfaceStreams: {
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
    interfaceStreams: ctx.interfaceStreams,
    taskRunners: ctx.taskRunners,
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
    execute(ctx, event(dispatchData[2]))
  } else {
    ctx.error('dispatch', `there are no event with id '${dispatchData[1]}' in module '${dispatchData[0]}'`)
  }
}

export function execute (ctx: Context, executable: Executable | Executable[]) {
  let componentSpace = ctx.components[ctx.id]

  if (typeof executable === 'function') {
    // single update
    componentSpace.state = (<Update> executable)(componentSpace.state)
    notifyInterfaceHandlers(ctx)
  } else {
    /* istanbul ignore else */
    if (executable instanceof Array) {
      if (executable[0] && typeof executable[0] === 'string') {
        // single task
        if (!ctx.taskRunners[executable[0]]) {
          return ctx.error('execute', `there are no task handler for ${executable[0]}`)
        }
        ctx.taskRunners[executable[0]](executable[1])
      } else {
        /* istanbul ignore else */
        if (executable[0] instanceof Array || typeof executable[0] === 'function') {
          // list of updates and tasks
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') {
              // is an update
              componentSpace.state = (<Update>executable[i])(componentSpace.state)
              notifyInterfaceHandlers(ctx)
            } else {
                /* istanbul ignore else */
                if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
                // single task
                if (!ctx.taskRunners[executable[i][0]]) {
                  return ctx.error('execute', `there are no task handler for ${executable[i][0]}`)
                }
                ctx.taskRunners[executable[i][0]](executable[i][1])
              }
            }
            // the else branch never occurs because of Typecript check
          }
        }
      }
    }
    // the else branch never occurs because of Typecript check
  }
}

// permorms interface recalculation
export function notifyInterfaceHandlers (ctx: Context) {
  let space = ctx.components[ctx.id]
  for (let name in  ctx.interfaceStreams) {
    ctx.interfaceStreams[name].set(space.interfaces[name](ctx, space.state))
  }
}

export interface InterfaceHandlerStreams {
  [driverName: string]: Stream<InterfaceMsg>
}

// function for running a root component
export function run (moduleDefinition: ModuleDef): Module {
  // internal module state
  // root component
  let component: Component
  let moduleDef: ModuleDef
  // root context
  let ctx: Context
  let interfaceHanlerObjects: {
    [name: string]: InterfaceHandlerObject
  }

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
      // component index
      components: {},
      taskRunners: {},
      interfaceStreams: {},
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

    // API for modules
    let moduleAPI: ModuleAPI = {
      // dispatch function type used for handlers
      dispatch: (dispatchData) => dispatch(ctx, dispatchData),
      // merge a component to the component index
      merge: (parentId, name, component) => merge(ctx, name, component),
      // merge many components to the component index
      mergeAll: (parentId, components) => mergeAll(ctx, components),
    }
    // pass ModuleAPI to every InterfaceFunction
    interfaceHanlerObjects = {}
    // TODO: optimize for (let in) with for (Object.keys())
    for (let name in moduleDef.interfaces) {
      interfaceHanlerObjects[name] = moduleDef.interfaces[name](moduleAPI)
    }
    // pass ModuleAPI to every TaskFunction
    for (let name in moduleDef.tasks) {
      ctx.taskRunners[name] = moduleDef.tasks[name](moduleAPI)
    }
    // inital state
    let newState = (state !== undefined) ? state : component.state({key: rootName})
    // reserve root space
    ctx.components[rootName] = {
      ctx,
      state: newState,
      events: component.events(ctx),
      interfaces: component.interfaces,
    }

    // creates interfaceStreams (interface recalculation)
    for (let name in component.interfaces) {
      if (interfaceHanlerObjects[name]) {
        ctx.interfaceStreams[name] = newStream(component.interfaces[name](ctx, ctx.components[rootName].state))
        // connect interface handlers to driver streams
        interfaceHanlerObjects[name][(state == undefined) ? 'attach' : 'reattach'](ctx.interfaceStreams[name])
      } else {
        return ctx.error('InterfaceHandlers', `'${rootName}' module has no interface called '${name}', missing interface handler`)
      }
    }

  }

  attach(undefined)

  return {
    moduleDef,
    // reattach root component, used for hot swaping
    reattach (comp: Component) {
      disposeinterfaceStreams(ctx)
      let lastComponents = ctx.components
      ctx.components = {}
      // TODO: use a deepmerge algoritm
      attach(lastComponents)
    },
    dispose () {
      // dispose all streams
      ctx.components = {}
      disposeinterfaceStreams(ctx)
      this.isDisposed = true
    },
    isDisposed: false,
    // related to internals
    interfaces: interfaceHanlerObjects,
    interfaceStreams: ctx.interfaceStreams,
    // root context
    ctx,
  }
}

export function disposeinterfaceStreams (ctx: Context) {
  for (var i = 0, keys = Object.keys(ctx.interfaceStreams); i < keys.length; i++) {
    ctx.interfaceStreams[keys[i]].dispose()
  }
}
