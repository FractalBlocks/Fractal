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
import { InterfaceHandler, InterfaceMsg } from './interface'
import { newStream, Stream } from './stream'

export interface ModuleDef {
  log?: boolean
  logAll?: boolean
  root: Component
  interfaces?: {
    [name: string]: InterfaceHandler
  }
}

export interface Module {
  moduleDef: ModuleDef
  reattach(root: Component): void
  dispose(): void
  isDisposed: boolean
  interfaces: {
    [name: string]: InterfaceHandler
  },
  driverStreams: {
    [name: string]: Stream<InterfaceMsg>
  }
}

// create context for a component
function createContext (ctx: Context, parent: string, name: string): Context {
  let id = `${parent}$${name}`
  return {
    id,
    components: ctx.components,
    // delegation
    warn: ctx.warn,
    error: ctx.error,
    do: ctx.do,
  }
}

// extracts the state from a certain component
export function getState (ctx, name) {
  return ctx.components[`${this.self}$${name}`].state
}

// extracts an interface message from a certain component
export function getInterface (ctx, name, interfaceName) {
  let componentSpace = ctx.components[`${this.self}$${name}`]
  return componentSpace.interfaces[interfaceName](componentSpace.state)
}

// add a module to the module index
export function merge (ctx: Context, ns: string, name: string, component: Component) {
  let identifier = ns + '$' + name // namespaced name
  if (ctx.components[identifier]) {
    return ctx.warn(ctx.id, `overwriting module ${identifier}`)
  }
  ctx.components[identifier] = {
    state: component.state({key: name}),
    inputs: component.inputs(createContext(ctx, ctx.id, identifier)),
  }
}

export function mergeAll (ctx: Context, ns: string, components: { [name: string]: Component }) {
  let space: ComponentSpace = { state: {}, inputs: {} }
  // ctx.components[ns + '$' + name] = {} TODO: CRITICAL
}

// create an input dispatch array
export function on (ctx: Context, inputName: string, paramFn?: EventFunction): EventData {
   return [ctx.id, inputName, paramFn]
}

export function dispatch (componentIndex: ComponentIndex, dispatchData: DispatchData) {
  componentIndex[dispatchData[0]].inputs[dispatchData[1]](dispatchData[2])
}

// function for running a root component
export function run (moduleDefinition: ModuleDef): Module {
  let moduleDef = {
    log: false,
    logAll: false,
    ...moduleDefinition,
  }
  // let state$ = newStream<any>(undefined),
  let driverStreams: { [driverName: string]: Stream<InterfaceMsg> } = {},
    component: Component

  // root context
  let ctx: Context = {
    id: 'root',
    do: (executable: Executable) => execute('root', executable),
    components: {}, // component index
    // error and warning handling
    warn: (source, description) => {
      console.warn(`source: ${source}, description: ${description}`)
    },
    error: (source, description) => {
      console.error(`source: ${source}, description: ${description}`)
    },
  }

  function execute (componentId: string, executable: Executable | Executable[]) {
    let componentSpace = ctx.components[componentId]
    if (typeof executable === 'function') {
      // single update
      componentSpace.state = (<Update>executable)(componentSpace.state)
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
      driverStreams[name].set(component.interfaces[name](ctx, ctx.components['root'].state))
    }
  }

  function attach (state) {
    // root component
    component = moduleDef.root
    // inital state
    let newState = (state !== undefined) ? state : component.state({key: component.name})
    // reserve root space
    ctx.components['root'] = {
      state: newState,
      inputs: {},
    }

    // creates driverStreams
    for (let name in moduleDef.interfaces) {
      if (component.interfaces[name]) {
        driverStreams[name] = newStream(component.interfaces[name](ctx, ctx.components['root'].state))
        // connect interface handlers to driver stream
        moduleDef.interfaces[name][(state == undefined) ? 'attach' : 'reattach'](driverStreams[name])
      } else {
        // TODO: document that drivers are renamed interface hanstatedlers
        console.warn(`Root Module has no interface called ${name}, unused interface handler`)
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
    interfaces: moduleDef.interfaces,
    driverStreams,
  }
}
