import {
  Component,
  Action,
  Update,
  Context,
  ComponentSpace,
  ComponentSpaceIndex,
  Executable,
  InputData,
  EventData,
  Interface,
} from './core'
import {
  HandlerInterface,
  HandlerMsg,
  HandlerObject,
  HandlerFunction,
} from './handler'

export interface ModuleDef {
  root: Component
  log?: boolean
  logAll?: boolean
  tasks?: {
    [name: string]: HandlerInterface
  }
  interfaces: {
    [name: string]: HandlerInterface
  }
  // lifecycle hooks for modules
  init? (mod: ModuleAPI): void
  destroy? (mod: ModuleAPI): void
  // callbacks (side effects) for log messages
  warn? (source: string, description: string): void
  error? (source: string, description: string): void
}

export interface Module {
  moduleDef: ModuleDef
  isDisposed: boolean
  // related to internals
  interfaceHandlers: {
    [name: string]: HandlerObject
  }
  taskHandlers: {
    [name: string]: HandlerObject
  }
  moduleAPI: ModuleAPI
  // Root component context
  ctx: Context
}

// API from module to handlers
export interface ModuleAPI {
  dispatch (eventData: EventData): void
  dispose (): void
  reattach (comp: Component): void
  merge (name: string, component: Component): void
  mergeAll (components: { [name: string]: Component }): void
  unmerge (name: string): void
  unmergeAll (components: string[]): void
  warn (source, description): void
  error (source, description): void
}

// create context for a component
export function createContext (ctx: Context, name: string): Context {
  let id = ctx.id === '' ? name : `${ctx.id}$${name}`
  return {
    id, // the component id
    // delegation
    components: ctx.components,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    warn: ctx.warn,
    error: ctx.error,
  }
}

// gets the state from a certain component
export function stateOf (ctx, name) {
  return ctx.components[`${ctx.id}$${name}`].state
}

// gets an interface message from a certain component
export function interfaceOf (ctx: Context, name: string, interfaceName: string): any {
  let id = `${ctx.id}$${name}`
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    ctx.error('interfaceOf', `there are no component space '${id}'`)
    return {}
  }
  if (!componentSpace.def.interfaces[interfaceName]) {
    ctx.error('interfaceOf', `there are no interface '${interfaceName}' in component '${componentSpace.def.name}' from space '${id}'`)
    return {}
  }
  return componentSpace.def.interfaces[interfaceName](componentSpace.ctx, componentSpace.state)
}

// add a component to the component index
export function merge (ctx: Context, name: string, component: Component): Context {
  // namespaced name if is a child
  let id = ctx.id === '' ? name : ctx.id + '$' + name
  if (ctx.components[id]) {
    ctx.warn('merge', `component '${ctx.id}' has overwritten component space '${id}'`)
  }

  if (ctx.components[ctx.id] && !ctx.components[ctx.id].components[name]) {
    ctx.components[ctx.id].components[name] = true
  }

  let childCtx = createContext(ctx, name)

  ctx.components[id] = {
    ctx: childCtx,
    state: component.state({key: name}),
    inputs: component.inputs(childCtx),
    components: Object.assign({}, component.components || {}),
    def: component,
  }
  // composition
  if (component.components) {
    mergeAll(childCtx, component.components)
  }
  // lifecycle hook: init
  if (component.init) {
    component.init(childCtx)
  }

  return childCtx
}

// add many components to the component index
export function mergeAll (ctx: Context, components: { [name: string]: Component }) {
  for (let i = 0, names = Object.keys(components), len = names.length; i < len; i++) {
    merge(ctx, names[i], components[names[i]])
  }
}

// remove a component to the component index, if name is not defined dispose the root
export function unmerge (ctx: Context, name?:  string): void {
  let id = name ? ctx.id + '$' + name : ctx.id
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    return ctx.error('unmerge', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  if (name) {
    delete ctx.components[ctx.id].components[name]
  }
  // decomposition
  let components = componentSpace.components
  /* istanbul ignore else */
  if (components) {
    unmergeAll(ctx.components[id].ctx, Object.keys(components))
  }
  // lifecycle hook: destroy
  if (componentSpace.def.destroy) {
    componentSpace.def.destroy(ctx.components[id].ctx)
  }

  delete ctx.components[id]
}

// add many components to the component index
export function unmergeAll (ctx: Context, components: string[]) {
  for (let i = 0, len = components.length; i < len; i++) {
    unmerge(ctx, components[i])
  }
}

// create an InputData array
export function ev (ctx: Context, inputName: string, param?: any, isFn?: boolean): InputData {
  return [ctx.id, inputName, param, !!isFn]
}

export function computeEvent(event: any, iData): EventData {
  let data
  if (iData[3]) {
    data = iData[2]
  } else {
    if (iData[2] === '*') {
      data = JSON.parse(JSON.stringify(event))
    } else {
      data = event[iData[2]]
    }
  }
  return [
    iData[0], // component id
    iData[1], // component event
    data, // data
  ]
}


// dispatch an input based on eventData to the respective component
export const dispatch = (ctx: Context, eventData: EventData) => {
  let componentSpace = ctx.components[eventData[0]]
  if (!componentSpace) {
    return ctx.error('dispatch', `there are no component space '${eventData[0]}'`)
  }
  let input = componentSpace.inputs[eventData[1]]
  if (input) {
    execute(ctx, eventData[0], input(eventData[2]))
  } else {
    ctx.error('dispatch', `there are no input named '${eventData[1]}' in component '${componentSpace.def.name}' from space '${eventData[0]}'`)
  }
}

export function execute (ctx: Context, id: string, executable: Executable | Executable[]) {
  let componentSpace = ctx.components[id]

  if (typeof executable === 'function') {
    // single update
    componentSpace.state = (<Update> executable)(componentSpace.state)
    notifyInterfaceHandlers(ctx)
  } else {
    /* istanbul ignore else */
    if (executable instanceof Array) {
      if (executable[0] && typeof executable[0] === 'string') {
        // single task
        if (!ctx.taskHandlers[executable[0]]) {
          return ctx.error('execute', `there are no task handler for '${executable[0]}' in component '${componentSpace.def.name}' from space '${id}'`)
        }
        ctx.taskHandlers[executable[0]].handle(executable[1])
      } else {
        /* istanbul ignore else */
        if (executable[0] instanceof Array || typeof executable[0] === 'function') {
          // list of updates and tasks
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') {
              // is an update
              componentSpace.state = (<Update> executable[i])(componentSpace.state)
              notifyInterfaceHandlers(ctx)
            } else {
                /* istanbul ignore else */
                if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
                // single task
                if (!ctx.taskHandlers[executable[i][0]]) {
                  return ctx.error('execute', `there are no task handler for '${executable[i][0]}' in component '${componentSpace.def.name}' from space '${id}'`)
                }
                ctx.taskHandlers[executable[i][0]].handle(executable[i][1])
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
  for (let name in  ctx.interfaceHandlers) {
    ctx.interfaceHandlers[name].handle(space.def.interfaces[name](ctx, space.state))
  }
}

// function for running a root component
export function run (moduleDefinition: ModuleDef): Module {
  // internal module state
  // root component
  let component: Component
  let moduleDef: ModuleDef
  let moduleAPI: ModuleAPI
  // root context
  let ctx: Context

  // attach root component
  function attach (comp?: Component, lastComponents?: ComponentSpaceIndex) {
    moduleDef = {
      log: false,
      logAll: false,
      ...moduleDefinition,
    }
    // root component, take account of hot swapping
    component = comp ? comp : moduleDef.root
    let rootName = component.name
    // if is hot swapping, do not recalculat context
    if (!lastComponents) {
      // root context
      ctx = {
        id: '',
        // component index
        components: {},
        taskHandlers: {},
        interfaceHandlers: {},
        // error and warning handling
        warn: (source, description) => {
          if (moduleDef.warn) {
            moduleDef.warn(source, description)
          }
        },
        error: (source, description) => {
          /* istanbul ignore else */
          if (moduleDef.error) {
            moduleDef.error(source, description)
          }
        },
      }
    } else {
      // hot swaping mode preserves root context, but restore id to '' because this way merge knows is root context
      ctx.id = ''
    }

    // API for modules
    moduleAPI = {
      // dispatch function type used for handlers
      dispatch: (eventData: EventData) => dispatch(ctx, eventData),
      dispose,
      reattach,
      // merge a component to the component index
      merge: (name: string, component: Component) => merge(ctx, name, component),
      // merge many components to the component index
      mergeAll: (components: { [name: string]: Component }) => mergeAll(ctx, components),
      // unmerge a component to the component index
      unmerge: (name: string) => unmerge(ctx, name),
      // unmerge many components to the component index
      unmergeAll: (components: string[]) => unmergeAll(ctx, components),
      // delegated methods
      warn: ctx.warn,
      error: ctx.error,
    }
    // if is not hot swapping
    if (!lastComponents) {
      // pass ModuleAPI to every InterfaceFunction
      for (let i = 0, names = Object.keys(moduleDef.interfaces), len = names.length; i < len; i++) {
        ctx.interfaceHandlers[names[i]] = moduleDef.interfaces[names[i]](moduleAPI)
      }
      // pass ModuleAPI to every TaskFunction
      if (moduleDef.tasks) {
        for (let i = 0, names = Object.keys(moduleDef.tasks), len = names.length; i < len; i++) {
          ctx.taskHandlers[names[i]] = moduleDef.tasks[names[i]](moduleAPI)
        }
      }
    }
    // merges main component and ctx.id now contains it name
    ctx = merge(ctx, component.name, component)
    // preserves state on hot swapping - TODO: make a deepmerge
    if (lastComponents) {
      for (let i = 0, ids = Object.keys(lastComponents), len = ids.length; i < len; i++) {
        // if the component still existing
        /* istanbul ignore else */
        if (ctx.components[ids[i]]) {
          ctx.components[ids[i]].state = lastComponents[ids[i]].state
        }
      }
    }

    for (let name in component.interfaces) {
      if (ctx.interfaceHandlers[name]) {
        ctx.interfaceHandlers[name].handle(component.interfaces[name](ctx, ctx.components[rootName].state))
      } else {
        return ctx.error(
          'InterfaceHandlers',
          `'${rootName}' module has no interface called '${name}', missing interface handler`
        )
      }
    }

    if (moduleDef.init) {
      moduleDef.init(moduleAPI)
    }

  }

  attach(undefined)

  function dispose () {
    if (moduleDef.destroy) {
      moduleDef.destroy(moduleAPI)
    }
    // dispose all streams
    unmerge(ctx)
    for (let i = 0, names = Object.keys(ctx.interfaceHandlers), len = names.length; i < len; i++) {
      ctx.interfaceHandlers[names[i]].dispose()
    }
    ctx = undefined
    this.isDisposed = true
  }

  function reattach (comp: Component) {
    let lastComponents = ctx.components
    ctx.components = {}
    // TODO: use a deepmerge algoritm
    attach(comp, lastComponents)
  }

  return {
    moduleDef,
    // reattach root component, used for hot swapping
    isDisposed: false,
    // related to internals
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    // root context
    moduleAPI,
    ctx,
  }
}
