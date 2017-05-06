import {
  Identifier,
  Component,
  Update,
  Context,
  ComponentSpaceIndex,
  InputData,
  EventData,
} from './core'
import {
  HandlerInterface,
  HandlerObject,
} from './handler'

export interface ModuleDef {
  root: Component<any>
  log?: boolean
  logAll?: boolean
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  // lifecycle hooks for modules
  beforeInit? (mod: ModuleAPI): void
  init? (mod: ModuleAPI): void
  destroy? (mod: ModuleAPI): void
  // Middleware for inputs
  onDispatch? (ctx: Context, eventData: EventData): void // TODO: REMOVE
  // callbacks (side effects) for log messages
  warn? (source: string, description: string): void
  error? (source: string, description: string): void
}

// a gap is defined with undefined (optional)
export const _ = undefined

export interface HandlerInterfaceIndex {
  [name: string]: HandlerInterface
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
  reattach (comp: Component<any>, middleFn?: MiddleFn): void
  merge (name: string, component: Component<any>): void
  mergeAll (components: { [name: string]: Component<any> }): void
  unmerge (name: string): void
  unmergeAll (components: string[]): void
  setGroup (id: string, name: string, space: any): void
  warn (source, description): void
  error (source, description): void
}

// MiddleFn is used for merge the states on hot-swaping (reattach)
export interface MiddleFn {
  (
    ctx: Context,
    components: ComponentSpaceIndex,
    lastComponents: ComponentSpaceIndex
  ): ComponentSpaceIndex
}

export const handlerTypes = ['interface', 'task', 'group']

// create context for a component
export function createContext (ctx: Context, name: Identifier): Context {
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
export function merge (ctx: Context, name: Identifier, component: Component<any>, isStatic = false): Context {
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
    isStatic,
    // if state is an object, it is cloned
    state: typeof component.state === 'object' ? clone(component.state) : component.state,
    inputs: component.inputs ? component.inputs(childCtx) : {},
    components: clone(component.components || {}),
    def: component,
  }

  // composition
  if (component.components) {
    mergeAll(childCtx, component.components, isStatic)
  }

  if (component.groups) {
    // Groups are handled automatically only when comoponent are initialized
    handleGroups(childCtx, component)
  }

  // lifecycle hook: init
  if (component.init) {
    component.init(childCtx)
  }

  return childCtx
}

function handleGroups (ctx: Context, component: Component<any>) {
  let space: HandlerObject
  let name
  for (name in component.groups) {
    space = ctx.groupHandlers[name]
    if (space) {
      space.handle([ctx.id, component.groups[name]])
    } else {
      ctx.error('merge', `module has no group handler for '${name}' of component '${component.name}' from space '${ctx.id}'`)
    }
  }
}

// add many components to the component index
export function mergeAll (ctx: Context, components: { [name: string]: Component<any> }, isStatic = false) {
  let name
  for (name in components) {
    merge(ctx, name, components[name], isStatic)
  }
}

// remove a component to the component index, if name is not defined dispose the root
export function unmerge (ctx: Context, name?:  string): void {
  let id = name !== undefined ? ctx.id + '$' + name : ctx.id
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    return ctx.error('unmerge', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  if (name !== undefined) {
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
  if (context !== undefined || param !== undefined) {
    return [ctx.id, inputName, context, param]
  } else {
    return [ctx.id, inputName]
  }
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
// TODO: test the propagation
export const dispatch = (ctxIn: Context, eventData: EventData, isPropagated = true) => {
  let id = eventData[0] + ''
  // root component
  let ctx = ctxIn.components[(id + '').split('$')[0]].ctx
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    return ctx.error('dispatch', `there are no component space '${id}'`)
  }
  let inputName = eventData[1]
  // extract data from eventData
  let data = eventData[4] === 'pair' // is both?
    ? [eventData[2], eventData[3]] // is both event data + context
    : eventData[4] === 'context'
    ? eventData[2] // is only context
    : eventData[3] // is only event data
  execute(componentSpace.ctx, inputName, data)
}

export function propagate (ctx: Context, inputName: string, data: any) {
  // notifies parent if name starts with $
  let id = ctx.id
  let idParts = (id + '').split('$')
  let componentSpace = ctx.components[id]
  if (idParts.length > 1) {
    // is not root?
    let parentId = idParts.slice(0, -1).join('$')
    let parentSpace = ctx.components[parentId]
    let msg
    let parentInputName
    if (inputName[0] === '$') {
      // global notifier ($some), genrally used for lists of components
      let childInputName = inputName.slice(1, inputName.length)
      parentInputName = `$$${componentSpace.def.name}_${childInputName}`
      msg = componentSpace.ctx.name
    } else {
      // individual parent notifier
      parentInputName = `$${componentSpace.ctx.name}_${inputName}`
      msg = data
    }
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      execute(parentSpace.ctx, parentInputName, msg)
    }
  }
}

export function execute (ctxIn: Context, inputName: string, data: any, isPropagated = true) {
  let id = ctxIn.id
  let rootId = (id + '').split('$')[0]
  // Obtain root context
  let ctx = ctxIn.components[rootId].ctx
  let componentSpace = ctx.components[id]

  let input = componentSpace.inputs[inputName]

  if (input === undefined) {
    ctx.error(
      'execute',
      `there are no input named '${inputName}' in component '${componentSpace.def.name}' from space '${id}'`
    )
    return
  }
  /* istanbul ignore else */
  if (<any> input !== 'nothing') {
    // call the input
    let executable = input(data)

    if (executable !== undefined) {
      if (typeof executable === 'function') {
        // single update
        componentSpace.state = (<Update<any>> executable)(componentSpace.state)
        notifyInterfaceHandlers(ctx) // root context
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
                  componentSpace.state = (<Update<any>> executable[i])(componentSpace.state)
                  notifyInterfaceHandlers(ctx) // root context
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
  }
  /* istanbul ignore else */
  if (isPropagated && ctx.components[id]) { // is propagated and component space still exist
    propagate(ctxIn, inputName, data)
  }
}

// permorms interface recalculation
export function notifyInterfaceHandlers (ctx: Context) {
  let space = ctx.components[ctx.id]
  let name
  for (name in space.def.interfaces) {
    if (ctx.interfaceHandlers[name]) {
      ctx.interfaceHandlers[name].handle(space.def.interfaces[name](ctx, space.state))
    } else {
      // This only can happen when this method is called for a context that is not the root
      ctx.error('notifyInterfaceHandlers', `module does not have interface handler named '${name}' for component '${space.def.name}' from space '${ctx.id}'`)
    }
  }
}

// function for running a root component
export function run (moduleDef: ModuleDef): Module {
  // internal module state
  // root component
  let component: Component<any>
  let moduleAPI: ModuleAPI
  // root context
  let ctx: Context

  // attach root component
  function attach (comp?: Component<any>, lastComponents?: ComponentSpaceIndex, middleFn?: MiddleFn) {
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
      dispatch: moduleDef.onDispatch
        ? (eventData: EventData) => {
          dispatch(ctx, eventData)
          moduleDef.onDispatch(ctx, eventData)
        } : (eventData: EventData) => dispatch(ctx, eventData),
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
          let name
          for (name in handlers) {
            ctx[handlerTypes[c] + 'Handlers'][name] = handlers[name](moduleAPI)
          }
        }
      }
    }

    // merges main component and ctx.id now contains it name
    ctx = merge(ctx, component.name, component, true)

    // middle function for hot-swapping
    if (middleFn) {
      ctx.components = middleFn(ctx, ctx.components, lastComponents)
      let id
      for (id in ctx.components) {
        if (!ctx.components[id].isStatic) {
          handleGroups(ctx.components[id].ctx, ctx.components[id].def)
        }
      }
    }

    // pass initial value to each Interface Handler
    let name
    for (name in component.interfaces) {
      if (ctx.interfaceHandlers[name]) {
        ctx.interfaceHandlers[name].handle(component.interfaces[name](ctx, ctx.components[rootName].state))
      } else {
        return ctx.error(
          'InterfaceHandlers',
          `'${rootName}' component has no interface called '${name}', missing interface handler`
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
      let name
      for (name in handlers) {
        handlers[name].dispose()
      }
    }
    unmerge(ctx)
    ctx = undefined
    this.isDisposed = true
  }

  function reattach (comp: Component<any>, middleFn?: MiddleFn) {
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
