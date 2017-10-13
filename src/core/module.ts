import {
  Component,
  Update,
  Context,
  EventData,
  Components,
  Interfaces,
  CtxInterfaceIndex,
  Actions,
  GenericExecutable,
} from './core'
import {
  HandlerInterface,
  HandlerObject,
} from './handler'
import { makeInterfaceHelpers, dispatch } from './interface'
import { makeInputHelpers } from './input'

export interface ModuleDef {
  root: Component<any>
  record?: boolean
  render?: boolean // initial render flag
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
  rootCtx: Context
}

// API from module to handlers
export interface ModuleAPI {
  dispatch (eventData: EventData): Promise<void>
  dispose (): void
  reattach (comp: Component<any>, lastCtx?: Context, middleFn?: MiddleFn): Promise<void>
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
    lastCtx: Context
  ): void
}

export const handlerTypes = ['interface', 'task', 'group']

export interface CtxNest {
  (name: string, component: Component<any>, isStatic?: boolean): void
}

// add a component to the component index
export const nest = (ctx: Context): CtxNest => async (name, component) => {
  // create the global object for initialization
  ctx.global = {
    record: ctx.global.record,
    records: ctx.global.records,
    render: true,
  }
  await _nest(ctx, name, component)
}

/* istanbul ignore next */
async function _nest (ctx: Context, name: string, component: Component<any>): Promise<Context> {
  // namespaced name if is a child
  let id = ctx.id === '' ? name : ctx.id + '$' + name
  // state default
  component.state._nest = component.state._nest || {}

  ctx.components[id] = {
    id, // the component id
    name,
    groups: {},
    // delegation
    rootCtx: ctx.rootCtx,
    global: ctx.global,
    hotSwap: ctx.hotSwap,
    components: ctx.components,
    groupHandlers: ctx.groupHandlers,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    beforeInput: ctx.beforeInput,
    afterInput: ctx.afterInput,
    warn: ctx.warn,
    error: ctx.error,
    actionQueue: [],
    stateLocked: false,
    // if state is an object, it is cloned
    state: clone(component.state),
    inputs: {}, // input helpers needs to be initialized after ComponentSpace, because references
    interfaces: {},
    interfaceValues: {},
  }

  let childCtx = ctx.components[id]

  childCtx.interfaces = _makeInterfaces(childCtx, component.interfaces)

  if (component.inputs) {
    childCtx.inputs = component.inputs(makeInputHelpers(childCtx))
  } else {
    childCtx.inputs = {}
  }
  if (component.actions) { // reserved inputs: _action and _return
    if (!childCtx.inputs['action']) {
      // action helper enabled by default
      childCtx.inputs['action'] = action(childCtx, component.actions)
    }
    if (!childCtx.inputs['return']) {
      // action helper enabled by default
      childCtx.inputs['return'] = x => x
    }
  }

  // composition
  if (Object.keys(component.state._nest).length > 0) {
    await nestAll(childCtx)(component.state._nest)
  }

  if (component.groups) {
    // Groups are handled automatically only when comoponent are initialized
    await handleGroups(childCtx, component)
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

async function handleGroups (ctx: Context, component: Component<any>) {
  let space: HandlerObject
  let name
  for (name in component.groups) {
    space = ctx.groupHandlers[name]
    if (space) {
      await space.handle([ctx.id, component.groups[name]])
    } else {
      ctx.error(
        'nest',
        `module has no group handler for '${name}' of component '${ctx.name}' from space '${ctx.id}'`
      )
    }
  }
}

export interface CtxNestAll {
  (components: Components, isStatic?: boolean): Promise<void>
}

// add many components to the component index
/* istanbul ignore next */
export const nestAll = (ctx: Context): CtxNestAll => async (components, isStatic = false) => {
  let name
  for (name in components) {
    await _nest(ctx, name, components[name])
  }
}

export interface CtxUnnest {
  (name?:  string): Promise<void>
}

// remove a component to the component index, if name is not defined dispose the root
export const unnest = (ctx: Context): CtxUnnest => async name => {
  let id = name !== undefined ? ctx.id + '$' + name : ctx.id
  let componentSpace = ctx.components[id]
  /* istanbul ignore next */
  if (!componentSpace) {
    return ctx.error('unnest', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  // decomposition
  let components = componentSpace.components
  /* istanbul ignore else */
  if (components) {
    await unnestAll(componentSpace)(Object.keys(componentSpace.state._nest))
  }
  // lifecycle input: _destroy
  if (componentSpace.inputs._destroy) {
    await toIt(componentSpace)('_destroy')
  }

  delete ctx.components[id]
}

export interface CtxUnnestAll {
  (components: string[]): Promise<void>
}

// add many components to the component index
export const unnestAll = (ctx: Context): CtxUnnestAll => async components => {
  let _unnest = unnest(ctx)
  for (let i = 0, len = components.length; i < len; i++) {
    await _unnest(components[i])
  }
}

export async function propagate (ctx: Context, inputName: string, data: any) {
  // notifies parent if name starts with $
  let id = ctx.id
  let idParts = (id + '').split('$')
  let componentSpace = ctx.components[id]
  if (idParts.length > 1) {
    // is not root?
    let parentId = idParts.slice(0, -1).join('$')
    let parentSpace = ctx.components[parentId]
    let parentInputName
    parentInputName = `$${componentSpace.name}_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      await toIt(parentSpace)(parentInputName, data)
    }
    parentInputName = `$$${componentSpace.name.split('_')[0]}_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      await toIt(parentSpace)(parentInputName, [componentSpace.name, data])
    }
    parentInputName = `$_${inputName}`
    /* istanbul ignore else */
    if (parentSpace.inputs[parentInputName]) {
      await toIt(parentSpace)(parentInputName, [componentSpace.name, data, componentSpace.name])
    }
  }
}

export interface CtxToIt {
  (inputName: string, data?, isPropagated?: boolean): Promise<void>
}

// send a message to an input of a component from itself
// There area a weird behaviuor in istanbul coverage
/* istanbul ignore next */
export const toIt = (ctx: Context): CtxToIt => {
  let id = ctx.id
  let componentSpace = ctx.components[id]
  return async (inputName, data, isPropagated = true) => {
    let input = componentSpace.inputs[inputName]
    if (input === undefined) {
      ctx.error(
        'execute',
        `there are no input named '${inputName}' in component '${componentSpace.name}' from space '${id}'`
      )
      return
    }
    if (ctx.beforeInput) await ctx.beforeInput(ctx, inputName, data)
    await input(data)
    if (ctx.afterInput) await ctx.afterInput(ctx, inputName, data)
  }
}

// execute an executable in a context, executable parameter should not be undefined
export async function execute (ctx: Context, executable: GenericExecutable<any>) {
  let id = ctx.id
  let compCtx = ctx.components[id]

  if (typeof executable === 'function') {
    performUpdate(compCtx, executable)
  } else {
    /* istanbul ignore else */
    if (executable instanceof Array) {
      if (executable[0] && typeof executable[0] === 'string') {
        // single task
        if (!ctx.taskHandlers[executable[0]]) {
          return ctx.error(
            'execute',
            `there are no task handler for '${executable[0]}' in component '${compCtx.name}' from space '${id}'`
          )
        }
        await ctx.taskHandlers[executable[0]].handle(executable[1])
      } else {
        /* istanbul ignore else */
        if (executable[0] instanceof Array || typeof executable[0] === 'function') {
          // list of updates and tasks
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') { // is an update?
              performUpdate(compCtx, executable[i])
            } else {
                /* istanbul ignore else */
                if (executable[i] instanceof Array && typeof executable[i][0] === 'string') {
                // single task
                if (!ctx.taskHandlers[executable[i][0]]) {
                  return ctx.error(
                    'execute',
                    `there are no task handler for '${executable[i][0]}' in component '${compCtx.name}' from space '${id}'`
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

export function performUpdate (compCtx: Context, update: Update<any>) {
  if (compCtx.stateLocked) {
    compCtx.actionQueue.push(update)
  } else {
    compCtx.stateLocked = true
    compCtx.state = (<Update<any>> update)(compCtx.state)
    if (compCtx.global.record) {
      compCtx.global.records.push({ id: compCtx.id, update })
    }
    if (compCtx.global.render) {
      calcAndNotifyInterfaces(compCtx) // root context
    }
    compCtx.stateLocked = false
    let nextUpdate = compCtx.actionQueue.shift()
    if (nextUpdate) {
      performUpdate(compCtx, nextUpdate)
    }
  }
}

export function calcAndNotifyInterfaces (ctx: Context) {
  // calc and caches interfaces
  let space = ctx.components[ctx.id]
  let idParts = (ctx.id + '').split('$')
  idParts.pop()
  for (let name in space.interfaces) {
    setTimeout(async () => {
      space.interfaceValues[name] = await space.interfaces[name](space.state)
      // remove cache of parent component spaces
      let parts = idParts.slice(0)
      for (let i = parts.length - 1; i >=0 ; i--) {
        ctx.components[parts.join('$')].interfaceValues[name] = undefined
        parts.pop()
      }
      await notifyInterfaceHandlers(ctx)
    }, 0)
  }
}

// permorms interface recalculation
export async function notifyInterfaceHandlers (ctx: Context) {
  let space = ctx.components[ctx.rootCtx.id]
  for (let name in space.interfaces) {
    if (ctx.interfaceHandlers[name]) {
      ctx.interfaceHandlers[name].handle(await space.interfaces[name](space.state))
    } else {
      // This only can happen when this method is called for a context that is not the root
      ctx.error('notifyInterfaceHandlers', `module does not have interface handler named '${name}' for component '${space.name}' from space '${ctx.id}'`)
    }
  }
}

// function for running a root component
export async function run (moduleDef: ModuleDef): Promise<Module> {
  // internal module state
  // root component
  let component: Component<any>
  let moduleAPI: ModuleAPI
  // root context
  let ctx: Context

  // attach root component
  async function attach (comp: Component<any>, lastCtx?: Context, middleFn?: MiddleFn) {
    // root component, take account of hot swapping
    component = comp ? comp : moduleDef.root
    // if is hot swapping, do not recalculat context
    // root context
    ctx = <any> { // because of rootCtx delegation
      id: '',
      name: 'Root',
      groups: {},
      global: {
        record: moduleDef.record || false,
        records: [],
        render: true,
      },
      hotSwap: false,
      // component index
      components: {},
      groupHandlers: {},
      taskHandlers: {},
      interfaces: {},
      interfaceHandlers: {},
      // error and warning handling
      beforeInput: (ctxIn, inputName, data) => {
        /* istanbul ignore else */
        if (moduleDef.beforeInput) {
          moduleDef.beforeInput(ctxIn, inputName, data)
        }
      },
      afterInput: (ctxIn, inputName, data) => {
        /* istanbul ignore else */
        if (moduleDef.afterInput) {
          moduleDef.afterInput(ctxIn, inputName, data)
        }
      },
      warn: (source, description) => {
        /* istanbul ignore else */
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
        ctx.components[id].groups[name] = space
      },
      // delegated methods
      warn: ctx.warn,
      error: ctx.error,
    }

    // module lifecycle hook: init
    if (moduleDef.beforeInit && !middleFn) {
      moduleDef.beforeInit(moduleAPI)
    }

    // if is not hot swapping
    if (!middleFn) {
      // pass ModuleAPI to every Interface, Task and Space HandlerFunction
      let handlers: HandlerInterfaceIndex
      for (let c = 0, len = handlerTypes.length; c < len; c++) {
        handlers = moduleDef[handlerTypes[c] + 's']
        if (handlers) {
          let name
          for (name in handlers) {
            ctx[handlerTypes[c] + 'Handlers'][name] = await handlers[name](moduleAPI)
          }
        }
      }
    }

    if (middleFn) {
      ctx.hotSwap = true
    }

    // Root component
    await _nest(ctx, 'Root', component)
    ctx.rootCtx = ctx.components.Root
    ctx.components.Root.rootCtx = ctx.rootCtx

    // middle function for hot-swapping
    if (middleFn) {
      middleFn(ctx, lastCtx)
    }

    // pass initial value to each Interface Handler
    // -- interfaceOrder
    let interfaceOrder = moduleDef.interfaceOrder
    let name
    let errorNotHandler = name => ctx.error(
      'InterfaceHandlers',
      `'$.Root' component has no interface called '${name}', missing interface handler`
    )
    if (interfaceOrder) {
      for (let i = 0; name = interfaceOrder[i]; i++) {
        if (ctx.interfaceHandlers[name]) {
          ctx.interfaceHandlers[name].handle(ctx.rootCtx.interfaces[name](ctx.components.Root.state))
        } else {
          return errorNotHandler(name)
        }
      }
    }
    for (name in ctx.rootCtx.interfaces) {
      if (interfaceOrder && interfaceOrder.indexOf(name) !== -1) {
        continue // interface evaluated yet
      }
      if (ctx.interfaceHandlers[name]) {
        ctx.interfaceHandlers[name].handle(
          await ctx.rootCtx.interfaces[name](ctx.components.Root.state)
        )
      } else {
        return errorNotHandler(name)
      }
    }

    // module lifecycle hook: init
    if (moduleDef.init && !middleFn) {
      moduleDef.init(moduleAPI)
    }

  }

  await attach(undefined)

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

  async function reattach (comp: Component<any>, lastCtx: Context, middleFn: MiddleFn) {
    await attach(comp, lastCtx, middleFn)
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
    rootCtx: ctx,
  }
}

// generic action input
export const action = (ctx: Context, actions: Actions<any>) => async ([arg1, arg2]: any): Promise<void> => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
    if (arg2 !== undefined) {
      // add fetch value
      // TODO: test it!!
      value = (value !== undefined) ? [value, arg2]: arg2
    }
  } else {
    name = arg1
    value = arg2
  }
  execute(ctx, actions[name](value))
}

export function clone (o) {
   var out, v, key
   out = Array.isArray(o) ? [] : {}
   for (key in o) {
       v = o[key]
       out[key] = (typeof v === 'object') ? clone (v) : v
   }
   return out
}
