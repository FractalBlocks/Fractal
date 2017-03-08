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

export interface HandlerInterfaceIndex {
  [name: string]: HandlerInterface
}

export interface ModuleDef {
  root: Component
  log?: boolean
  logAll?: boolean
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  // lifecycle hooks for modules
  beforeInit? (mod: ModuleAPI): void
  init? (mod: ModuleAPI): void
  destroy? (mod: ModuleAPI): void
  // callbacks (side effects) for log messages
  warn? (source: string, description: string): void
  error? (source: string, description: string): void
}

export interface HandlerObjectIndex {
  [name: string]: HandlerObject
}

export interface Module {
  moduleDef: ModuleDef
  isDisposed: boolean
  // related to internals
  groupHandlers: HandlerObjectIndex
  interfaceHandlers: HandlerObjectIndex
  taskHandlers: HandlerObjectIndex
  // API to module
  moduleAPI: ModuleAPI
  // Root component context
  ctx: Context
}

// API from module to handlers
export interface ModuleAPI {
  dispatch (eventData: EventData): void
  dispose (): void
  reattach (comp: Component, middleFn?: MiddleFn): void
  merge (name: string, component: Component): void
  mergeAll (components: { [name: string]: Component }): void
  unmerge (name: string): void
  unmergeAll (components: string[]): void
  setGroup (id: string, name: string, space: any): void
  warn (source, description): void
  error (source, description): void
}

export interface MiddleFn {
  (ctx: Context, lastComponents: ComponentSpaceIndex): void
}

export const handlerTypes = ['interface', 'task', 'group']

// create context for a component
export function createContext (ctx: Context, name: string): Context {
  let id = ctx.id === '' ? name : `${ctx.id}$${name}`
  return {
    id, // the component id
    name,
    groups: {},
    // delegation
    components: ctx.components,
    groupHandlers: ctx.groupHandlers,
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
    // if state is an object, it is cloned
    state: typeof component.state === 'object' ? clone(component.state) : component.state,
    inputs: component.inputs(childCtx),
    components: clone(component.components || {}),
    def: component,
  }

  // composition
  if (component.components) {
    mergeAll(childCtx, component.components)
  }

  if (component.groups) {
    // Groups are handled automatically only when comoponent are initialized
    let space: HandlerObject
    for (let i = 0, names = Object.keys(component.groups), len = names.length; i < len; i++) {
      space = ctx.groupHandlers[names[i]]
      if (space) {
        space.handle([childCtx.id, component.groups[names[i]]])
      } else {
        ctx.error('merge', `module has no group handler for '${names[i]}' of component '${component.name}' from space '${childCtx.id}'`)
      }
    }
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
export function ev (ctx: Context, inputName: string, context?: any, param?: any): InputData {
  if (context !== undefined) {
    return [ctx.id, inputName, context, param]
  } else {
    return [ctx.id, inputName]
  }
}

export function computeEvent(event: any, iData: InputData): EventData {
  let data

  if (iData[3] === '*') {
    // serialize the whole object
    data = JSON.parse(JSON.stringify(event))
  } else if (event && iData[3] !== undefined) {
    // have function string
    if (iData[3] instanceof Array) {
      // function string is a path, e.g. ['target', 'value']
      let path = iData[3]
      data = event
      for (let i = 0, len = path.length; i < len; i++) {
        data = data[path[i]]
      }
    } else {
      // function string is only a getter, e.g. 'target'
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
    iData[2] !== '' && iData[3] !== undefined
      ? 'pair'
      : iData[2]
      ? 'context'
      : 'fn',
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
    let data = eventData[4] === 'pair' // is both?
      ? [eventData[2], eventData[3]] // is both event data + context
      : eventData[4] === 'context'
      ? eventData[2] // is only context
      : eventData[3] // is only event data
    execute(ctx, eventData[0], input(data))
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

  // TODO: proof of concept, auto dispatching parent inputs if matches '$name'

}

// permorms interface recalculation
export function notifyInterfaceHandlers (ctx: Context) {
  let space = ctx.components[ctx.id]
  for (let i = 0, names = Object.keys(space.def.interfaces), len = names.length; i < len; i++) {
    if (ctx.interfaceHandlers[names[i]]) {
      ctx.interfaceHandlers[names[i]].handle(space.def.interfaces[names[i]](ctx, space.state))
    } else {
      // This only can happen when this method is called for a context that is not the root
      ctx.error('notifyInterfaceHandlers', `module does not have interface handler named '${names[i]}' for component '${space.def.name}' from space '${ctx.id}'`)
    }
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
  function attach (comp?: Component, lastComponents?: ComponentSpaceIndex, middleFn?: MiddleFn) {
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
        name: rootName,
        groups: {},
        // component index
        components: {},
        groupHandlers: {},
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
      merge: (name, component) => merge(ctx, name, component),
      // merge many components to the component index
      mergeAll: components => mergeAll(ctx, components),
      // unmerge a component to the component index
      unmerge: name => unmerge(ctx, name),
      // unmerge many components to the component index
      unmergeAll: components => unmergeAll(ctx, components),
      // set a space of a certain component
      setGroup: (id, name, space) => {
        ctx.components[id].ctx.groups[name] = space
      },
      // delegated methods
      warn: ctx.warn,
      error: ctx.error,
    }

    // module lifecycle hook: init
    if (moduleDef.beforeInit) {
      moduleDef.beforeInit(moduleAPI)
    }

    // if is not hot swapping
    if (!lastComponents) {
      // pass ModuleAPI to every Interface, Task and Space HandlerFunction
      let handlers: HandlerInterfaceIndex
      for (let c = 0, len = handlerTypes.length; c < len; c++) {
        handlers = moduleDef[handlerTypes[c] + 's']
        if (handlers) {
          for (let i = 0, names = Object.keys(handlers), len = names.length; i < len; i++) {
            ctx[handlerTypes[c] + 'Handlers'][names[i]] = handlers[names[i]](moduleAPI)
          }
        }
      }
    }
    // merges main component and ctx.id now contains it name
    ctx = merge(ctx, component.name, component)
    // middle function for hot-swapping
    if (middleFn) {
      middleFn(ctx, lastComponents)
    }

    // pass initial value to each Interface Handler
    for (let i = 0, names = Object.keys(component.interfaces), len = names.length; i < len; i++) {
      if (ctx.interfaceHandlers[names[i]]) {
        ctx.interfaceHandlers[names[i]].handle(component.interfaces[names[i]](ctx, ctx.components[rootName].state))
      } else {
        return ctx.error(
          'InterfaceHandlers',
          `'${rootName}' component has no interface called '${names[i]}', missing interface handler`
        )
      }
    }

    // module lifecycle hook: init
    if (moduleDef.init) {
      moduleDef.init(moduleAPI)
    }

  }

  attach(undefined)

  function dispose () {
    if (moduleDef.destroy) {
      moduleDef.destroy(moduleAPI)
    }
    // dispose all handlers
    let handlers: HandlerObjectIndex
    for (let c = 0, len = handlerTypes.length; c < len; c++) {
      handlers  = ctx[`${handlerTypes[c]}Handlers`]
      for (let i = 0, names = Object.keys(handlers), len = names.length; i < len; i++) {
        handlers[names[i]].dispose()
      }
    }
    unmerge(ctx)
    ctx = undefined
    this.isDisposed = true
  }

  function reattach (comp: Component, middleFn?: MiddleFn) {
    let lastComponents = ctx.components
    ctx.components = {}
    attach(comp, lastComponents, middleFn)
  }

  return {
    moduleDef,
    // reattach root component, used for hot swapping
    isDisposed: false,
    // related to internals
    groupHandlers: ctx.groupHandlers,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    // root context
    moduleAPI,
    ctx,
  }
}

export function clone (o) {
   var out, v, key
   out = Array.isArray(o) ? [] : {}
   for (key in o) {
       v = o[key]
       out[key] = (typeof v === "object") ? clone (v) : v
   }
   return out
}
