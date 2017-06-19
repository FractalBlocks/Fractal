import {
  Identifier,
  Component,
  Update,
  Context,
  ComponentSpaceIndex,
  EventData,
  Executable,
  Components,
  Interfaces,
  CtxInterfaceIndex,
} from './core'
import {
  HandlerInterface,
  HandlerObject,
} from './handler'
import { makeInterfaceHelpers, dispatch } from './interface'
import { makeInputHelpers } from './input'

export interface ModuleDef {
  root: Component<any>
  log?: boolean
  logAll?: boolean
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  interfaceOrder?: Array<string>
  // lifecycle hooks for modules
  beforeInit? (mod: ModuleAPI): void
  init? (mod: ModuleAPI): void
  destroy? (mod: ModuleAPI): void
  // hooks for inputs
  beforeInput? (ctxIn: Context, inputName: string, data: any): void
  afterInput? (ctxIn: Context, inputName: string, data: any): void
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
  nest: CtxNest
  unnest: CtxUnnest
  nestAll: CtxNestAll
  unnestAll: CtxUnnestAll
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
  return {
    id: `${ctx.id}$${name}`, // the component id
    name,
    groups: {},
    // delegation
    rootCtx: ctx.rootCtx,
    global: ctx.global,
    components: ctx.components,
    groupHandlers: ctx.groupHandlers,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    beforeInput: ctx.beforeInput,
    afterInput: ctx.afterInput,
    warn: ctx.warn,
    error: ctx.error,
  }
}

export interface CtxNest {
  (name: Identifier, component: Component<any>, isStatic?: boolean): Context | void
}

// add a component to the component index
export const nest = (ctx: Context) => (name, component, isStatic = false) => {
  // create the global object for initialization
  ctx.global = {
    initialized: false, // disable notifyInterfaceHandlers temporarily
  }

  let childCtx = _nest(ctx, name, component, isStatic)

  // init lifecycle hooks: init all descendant components
  initAll(childCtx)

  childCtx.global.initialized = true

  return childCtx
}

// init all descendant components
function initAll (ctx: Context) {
  let space = ctx.components[ctx.id]
  if (space.def.init) {
    space.def.init(makeInputHelpers(ctx))
  }
  let childName
  for (childName in space.components) {
    initAll(ctx.components[ctx.id + '$' + childName].ctx)
  }
}

/* istanbul ignore next */
function _nest (ctx: Context, name: Identifier, component: Component<any>, isStatic = false): Context {
  // namespaced name if is a child
  let id = ctx.id === '' ? name : ctx.id + '$' + name
  if (ctx.components[id]) {
    ctx.warn('nest', `component '${ctx.id}' has overwritten component space '${id}'`)
  }

  if (ctx.components[ctx.id] && !ctx.components[ctx.id].components[name]) {
    ctx.components[ctx.id].components[name] = true
  }

  let childCtx
  if (ctx.id === '') { // is root?
    childCtx = ctx
    ctx.id = name
  } else {
    childCtx = createContext(ctx, name)
  }

  ctx.components[id] = {
    ctx: childCtx,
    isStatic,
    // if state is an object, it is cloned
    state: typeof component.state === 'object' ? clone(component.state) : component.state,
    inputs: {}, // input helpers needs to be initialized after ComponentSpace, because references
    interfaces: _makeInterfaces(childCtx, component.interfaces),
    interfaceValues: {},
    components: clone(component.components || {}),
    def: component,
  }

  if (component.inputs) {
    ctx.components[id].inputs = component.inputs(makeInputHelpers(childCtx))
  }

  // composition
  if (component.components) {
    nestAll(childCtx)(component.components, isStatic)
  }

  if (component.groups) {
    // Groups are handled automatically only when comoponent are initialized
    handleGroups(childCtx, component)
  }

  return childCtx
}

function _makeInterfaces (ctx: Context, interfaces: Interfaces): CtxInterfaceIndex {
  let index: CtxInterfaceIndex = {}
  let name
  for (name in interfaces) {
    index[name] = interfaces[name](makeInterfaceHelpers(ctx))
  }
  return index
}

function handleGroups (ctx: Context, component: Component<any>) {
  let space: HandlerObject
  let name
  for (name in component.groups) {
    space = ctx.groupHandlers[name]
    if (space) {
      space.handle([ctx.id, component.groups[name]])
    } else {
      ctx.error(
        'nest',
        `module has no group handler for '${name}' of component '${component.name}' from space '${ctx.id}'`
      )
    }
  }
}

export interface CtxNestAll {
  (components: Components, isStatic?: boolean): void
}

// add many components to the component index
/* istanbul ignore next */
export const nestAll = (ctx: Context): CtxNestAll => (components, isStatic = false) => {
  let name
  for (name in components) {
    _nest(ctx, name, components[name], isStatic)
  }
}

export interface CtxUnnest {
  (name?:  string): void
}

// remove a component to the component index, if name is not defined dispose the root
export const unnest = (ctx: Context): CtxUnnest => name => {
  let id = name !== undefined ? ctx.id + '$' + name : ctx.id
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    return ctx.error('unnest', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  if (name !== undefined) {
    delete ctx.components[ctx.id].components[name]
  }
  // decomposition
  let components = componentSpace.components
  /* istanbul ignore else */
  if (components) {
    unnestAll(ctx.components[id].ctx)(Object.keys(components))
  }
  // lifecycle hook: destroy
  if (componentSpace.def.destroy) {
    componentSpace.def.destroy(makeInputHelpers(ctx.components[id].ctx))
  }

  delete ctx.components[id]
}

export interface CtxUnnestAll {
  (components: string[]): void
}

// add many components to the component index
export const unnestAll = (ctx: Context): CtxUnnestAll => components => {
  let _unnest = unnest(ctx)
  for (let i = 0, len = components.length; i < len; i++) {
    _unnest(components[i])
  }
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
    let parentInputName
    parentInputName = `$${componentSpace.ctx.name}_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      toIt(parentSpace.ctx)(parentInputName, data)
    }
    parentInputName = `$$${componentSpace.def.name}_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      toIt(parentSpace.ctx)(parentInputName, [componentSpace.ctx.name, data])
    }
    parentInputName = `$_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      toIt(parentSpace.ctx)(parentInputName, [componentSpace.ctx.name, data, componentSpace.def.name])
    }
  }
}

export interface CtxToIt {
  (inputName: string, data?, isAsync?: boolean, isPropagated?: boolean): void
}

// send a message to an input of a component from itself
export const toIt = (ctx: Context): CtxToIt => {
  let id = ctx.id
  let componentSpace = ctx.components[id]
  function toItSync (inputName, data, isPropagated) {
    let input = componentSpace.inputs[inputName]
    if (input === undefined) {
      ctx.error(
        'execute',
        `there are no input named '${inputName}' in component '${componentSpace.def.name}' from space '${id}'`
      )
      return
    }
    ctx.beforeInput(ctx, inputName, data)
    /* istanbul ignore else */
    if (<any> input !== 'nothing') {
      // call the input
      let executable = input(data)

      if (executable !== undefined) {
        execute(ctx, executable)
      }
    }
    /* istanbul ignore else */
    if (isPropagated && ctx.components[id]) { // is propagated and component space still exist
      propagate(ctx, inputName, data)
    }
    ctx.afterInput(ctx, inputName, data)
  }
  return (inputName, data, isAsync = false, isPropagated = true) =>
    isAsync
    ? setTimeout(() => toItSync(inputName, data, isPropagated), 0)
    : toItSync(inputName, data, isPropagated)
}

// execute an executable in a context, executable parameter should not be undefined
export function execute (ctx: Context, executable: void | Executable<any> | Executable<any>[]) {
  let id = ctx.id
  let componentSpace = ctx.components[id]

  if (typeof executable === 'function') {
    // single update
    componentSpace.state = (<Update<any>> executable)(componentSpace.state)
    /* istanbul ignore else */
    if (ctx.global.initialized) {
      calcAndNotifyInterfaces(ctx) // root context
    }
  } else {
    /* istanbul ignore else */
    if (executable instanceof Array) {
      if (executable[0] && typeof executable[0] === 'string') {
        // single task
        if (!ctx.taskHandlers[executable[0]]) {
          return ctx.error(
            'execute',
            `there are no task handler for '${executable[0]}' in component '${componentSpace.def.name}' from space '${id}'`
          )
        }
        ctx.taskHandlers[executable[0]].handle(executable[1])
      } else {
        /* istanbul ignore else */
        if (executable[0] instanceof Array || typeof executable[0] === 'function') {
          // list of updates and tasks
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') { // is an update?
              // perform the update
              componentSpace.state = (<Update<any>> executable[i])(componentSpace.state)
              /* istanbul ignore else */
              if (ctx.global.initialized) {
                calcAndNotifyInterfaces(ctx) // root context
              }
            } else {
                /* istanbul ignore else */
                if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
                // single task
                if (!ctx.taskHandlers[executable[i][0]]) {
                  return ctx.error(
                    'execute',
                    `there are no task handler for '${executable[i][0]}' in component '${componentSpace.def.name}' from space '${id}'`
                  )
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

export function calcAndNotifyInterfaces (ctx: Context) {
  // calc and caches interfaces
  let space = ctx.components[ctx.id]
  let idParts = (ctx.id + '').split('$')
  idParts.pop()
  for (let name in space.interfaces) {
    setTimeout(() => {
      space.interfaceValues[name] = space.interfaces[name](space.state)
      // remove cache of parent component spaces
      let parts = idParts.slice(0)
      for (let i = parts.length - 1; i >=0 ; i--) {
        ctx.components[parts.join('$')].interfaceValues[name] = undefined
        parts.pop()
      }
      notifyInterfaceHandlers(ctx)
    }, 0)
  }
}

// permorms interface recalculation
export function notifyInterfaceHandlers (ctx: Context) {
  let space = ctx.components[ctx.rootCtx.id]
  for (let name in space.interfaces) {
    if (ctx.interfaceHandlers[name]) {
      ctx.interfaceHandlers[name].handle(space.interfaces[name](space.state))
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
      ctx = <any> { // because of rootCtx delegation
        id: '',
        name: rootName,
        groups: {},
        global: {
          initialized: false,
        },
        // component index
        components: {},
        groupHandlers: {},
        taskHandlers: {},
        interfaceHandlers: {},
        // error and warning handling
        beforeInput: (ctxIn, inputName, data) => {
          if (moduleDef.beforeInput) {
            moduleDef.beforeInput(ctxIn, inputName, data)
          }
        },
        afterInput: (ctxIn, inputName, data) => {
          if (moduleDef.afterInput) {
            moduleDef.afterInput(ctxIn, inputName, data)
          }
        },
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
      ctx.rootCtx = ctx // nice right? :)
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
      nest: nest(ctx),
      // merge many components to the component index
      nestAll: nestAll(ctx),
      // unnest a component to the component index
      unnest: unnest(ctx),
      // unnest many components to the component index
      unnestAll: unnestAll(ctx),
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
    ctx = nest(ctx)(component.name, component, true)
    let rootSpace = ctx.components[ctx.id]

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
    // -- interfaceOrder
    let interfaceOrder = moduleDef.interfaceOrder
    let name
    let errorNotHandler = name => ctx.error(
      'InterfaceHandlers',
      `'${rootName}' component has no interface called '${name}', missing interface handler`
    )
    if (interfaceOrder) {
      for (let i = 0; name = interfaceOrder[i]; i++) {
        if (ctx.interfaceHandlers[name]) {
          ctx.interfaceHandlers[name].handle(rootSpace.interfaces[name](ctx.components[rootName].state))
        } else {
          return errorNotHandler(name)
        }
      }
    }
    for (name in rootSpace.interfaces) {
      if (interfaceOrder && interfaceOrder.indexOf(name) !== -1) {
        continue // interface evaluated yet
      }
      if (ctx.interfaceHandlers[name]) {
        ctx.interfaceHandlers[name].handle(rootSpace.interfaces[name](ctx.components[rootName].state))
      } else {
        return errorNotHandler(name)
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
    unnest(ctx)()
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
