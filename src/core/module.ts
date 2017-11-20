require('setimmediate') // Polyfill setImmediate

import {
  Component,
  Update,
  Context,
  Components,
  Interfaces,
  CtxInterfaceIndex,
  Actions,
  GenericExecutable,
  Action,
  InputData,
} from './core'
import {
  HandlerInterface,
  HandlerObject,
} from './handler'
import { makeInterfaceHelpers, dispatchEv, toComp } from './interface'
import { makeInputHelpers } from './input'

export interface ModuleDef {
  root: Component<any>
  record?: boolean
  log?: boolean
  render?: boolean // initial render flag
  active?: boolean
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  interfaceOrder?: Array<string>
  // lifecycle hooks for modules
  beforeInit? (mod: ModuleAPI): Promise<void>
  init? (mod: ModuleAPI): Promise<void>
  destroy? (mod: ModuleAPI): Promise<void>
  // hooks for inputs
  beforeInput? (ctxIn: Context, inputName: string, data: any): void
  afterInput? (ctxIn: Context, inputName: string, data: any): void
  // callbacks (side effects) for log messages
  warn? (source: string, description: string): Promise<void>
  error? (source: string, description: string): Promise<void>
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
  // API to module
  moduleAPI: ModuleAPI
  // Root component context
  rootCtx: Context
}

// API from module to handlers
export interface ModuleAPI {
  dispatchEv (event: any, iData: InputData): Promise<void>
  toComp (id: string, inputName: string, data: any, isPropagated?: boolean): Promise<void>
  dispose (): void
  attach (comp: Component<any>, app?: Module, middleFn?: MiddleFn): Promise<Module>
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
    app: Module
  ): void
}

export const handlerTypes = ['interface', 'task', 'group']

export interface CtxNest {
  (name: string, component: Component<any>, isStatic?: boolean): void
}

// Evaluate DEPRECATION
// add a component to the component index
export const nest = (ctx: Context): CtxNest => async (name, component) => {
  await _nest(ctx, name, component)
}

async function _nest (ctx: Context, name: string, component: Component<any>): Promise<Context> {
  // namespaced name if is a child
  let id = ctx.id === 'Root' && name === 'Root' ? 'Root' : ctx.id + '$' + name
  // state default
  component.state._nest = component.state._nest || {}
  component.state._compCounter = 0

  let childCtx: Context = {
    id, // the component id
    name,
    groups: {},
    // delegation
    global: ctx.global,
    components: ctx.components,
    groupHandlers: ctx.groupHandlers,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    beforeInput: ctx.beforeInput,
    afterInput: ctx.afterInput,
    warn: ctx.warn,
    error: ctx.error,
    actionQueue: [],
    // if state is an object, it is cloned
    state: clone(component.state),
    inputs: {}, // input helpers needs to be initialized after ComponentSpace, because references
    actions: component.actions,
    interfaces: {},
    interfaceValues: {},
  }

  ctx.components[id] =  childCtx

  childCtx.interfaces = _makeInterfaces(childCtx, component.interfaces)

  if (component.inputs) {
    childCtx.inputs = component.inputs(makeInputHelpers(childCtx))
  } else {
    childCtx.inputs = {}
  }
  if (component.actions) { // reserved inputs: _action and _return
    if (!childCtx.inputs._action) {
      // action helper enabled by default
      childCtx.inputs._action = action(childCtx, component.actions)
    }
    if (!childCtx.inputs._execute) {
      // action helper enabled by default
      childCtx.inputs._execute = executeInput(childCtx)
    }
    if (!childCtx.actions.Set) {
      childCtx.actions.Set = SetAction
    }
    if (!childCtx.actions._remove) {
      childCtx.actions._remove = _removeAction
    }
  }

  // composition
  if (Object.keys(childCtx.state._nest).length > 0) {
    let components = childCtx.state._nest
    for (name in components) {
      await _nest(childCtx, name, components[name])
    }
  }
  childCtx.state._compNames = Object.keys(childCtx.state._nest)

  if (component.groups) {
    // Groups are handled automatically only when comoponent are initialized
    await handleGroups(childCtx, component)
  }

  if (childCtx.inputs.init && !childCtx.global.hotSwap) {
    await childCtx.inputs.init()
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
  if (!componentSpace) {
    return ctx.error('unnest', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  // decomposition
  let components = componentSpace.components
  /* istanbul ignore else */
  if (components) {
    await unnestAll(componentSpace)(Object.keys(componentSpace.state._nest))
  }
  if (ctx.inputs.destroy && !ctx.global.hotSwap) {
    await ctx.inputs.destroy()
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
    parentInputName = `$${componentSpace.name.split('_')[0]}_${inputName}`
    if (parentSpace.inputs[parentInputName]) {
      let name = componentSpace.name.split('_')[1]
      await toIt(parentSpace)(parentInputName, name ? [name, data] : data)
    }
    parentInputName = `$_${inputName}`
    if (parentSpace.inputs[parentInputName]) {
      await toIt(parentSpace)(parentInputName, [componentSpace.name, data])
    }
  }
}

export interface CtxToIt {
  (inputName: string, data?, isPropagated?: boolean): Promise<void>
}

// send a message to an input of a component from itself
export const toIt = (ctx: Context): CtxToIt => {
  let id = ctx.id
  let componentSpace = ctx.components[id]
  return async (inputName, data, isPropagated = true) => {
    if (!ctx.global.active) {
      return
    }
    let input = componentSpace.inputs[inputName]
    if (input === undefined) {
      ctx.error(
        'execute',
        `there are no input named '${inputName}' in component '${componentSpace.name}' from space '${id}'`
      )
      return
    }
    if (ctx.beforeInput) ctx.beforeInput(ctx, inputName, data)
    let result = await input(data)
    if (ctx.afterInput) ctx.afterInput(ctx, inputName, data)
    if (isPropagated) {
      await propagate(ctx, inputName, data)
    }
    return result
  }
}

// execute an executable in a context, executable parameter should not be undefined
export async function execute (ctx: Context, executable: GenericExecutable<any>) {
  let id = ctx.id
  let compCtx = ctx.components[id]

  if (typeof executable === 'function') {
    return await performUpdate(compCtx, executable)
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
        return await ctx.taskHandlers[executable[0]].handle(executable[1])
      } else {
        /* istanbul ignore else */
        if (executable[0] instanceof Array || typeof executable[0] === 'function') {
          // list of updates and tasks
          let results = []
          for (let i = 0, len = executable.length; i < len; i++) {
            if (typeof executable[i] === 'function') { // is an update?
              results.push(await performUpdate(compCtx, executable[i]))
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
                results.push(await ctx.taskHandlers[executable[i][0]].handle(executable[i][1]))
              }
            }
            // the else branch never occurs because of Typecript check
          }
          return results
        }
      }
    }
    // the else branch never occurs because of Typecript check
  }
}

export async function performUpdate (compCtx: Context, update: Update<any>): Promise<any> {
  let updateRes = update(compCtx.state)
  if (updateRes instanceof Promise) {
    compCtx.state = await updateRes
  } else {
    compCtx.state = updateRes
  }
  if (compCtx.state._compUpdated) {
    compCtx.global.render = false
    let compNames = compCtx.state._compNames
    let newCompNames = Object.keys(compCtx.state._nest)
    let newNames = newCompNames.filter(n => compNames.indexOf(n) < 0)
    let removeNames = compNames.filter(n => newCompNames.indexOf(n) < 0)
    for (let i = 0, len = newNames.length; i < len; i++) {
      await _nest(compCtx, newNames[i], compCtx.state._nest[newNames[i]])
    }
    for (let i = 0, len = removeNames.length; i < len; i++) {
      await unnest(compCtx)(removeNames[i])
    }
    compCtx.state._compUpdated = false
    compCtx.state._compNames = newCompNames
    compCtx.global.render = true
  }
  if (compCtx.global.moduleRender && compCtx.global.render) {
    calcAndNotifyInterfaces(compCtx) // root context
  } else {
    compCtx.interfaceValues = {}
  }
  return compCtx.state
}

export function calcAndNotifyInterfaces (ctx: Context) {
  // calc and caches interfaces
  let space = ctx.components[ctx.id]
  let idParts = (ctx.id + '').split('$')
  idParts.pop()
  for (let name in space.interfaces) {
    setImmediate(async () => {
      space.interfaceValues[name] = await space.interfaces[name](space.state)
      // remove cache of parent component spaces
      let parts = idParts.slice(0)
      for (let i = parts.length - 1; i >=0 ; i--) {
        ctx.components[parts.join('$')].interfaceValues[name] = undefined
        parts.pop()
      }
      // permorms interface recalculation
      let rootSpace = ctx.components[ctx.components.Root.id]
      for (let name in rootSpace.interfaces) {
        if (ctx.interfaceHandlers[name]) {
          ctx.interfaceHandlers[name].handle(await rootSpace.interfaces[name](rootSpace.state))
        } else {
          // This only can happen when this method is called for a context that is not the root
          ctx.error('notifyInterfaceHandlers', `module does not have interface handler named '${name}' for component '${space.name}' from space '${ctx.id}'`)
        }
      }
    })
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
  async function attach (comp: Component<any>, app?: Module, middleFn?: MiddleFn): Promise<Module> {
    // root component, take account of hot swapping
    component = comp ? comp : moduleDef.root
    // if is hot swapping, do not recalculate context
    // bootstrap context (level 0)
    if (!middleFn) {
      ctx = <any> { // because of rootCtx delegation
        id: 'Root',
        name: 'Root',
        groups: {},
        global: {
          record: moduleDef.hasOwnProperty('record') ? moduleDef.record : false,
          records: [],
          log: moduleDef.hasOwnProperty('log') ? moduleDef.log : false,
          moduleRender: moduleDef.hasOwnProperty('render') ? moduleDef.render : true,
          render: true,
          active: moduleDef.hasOwnProperty('active') ? moduleDef.active : true,
        },
        // component index
        components: {},
        groupHandlers: {},
        taskHandlers: {},
        interfaces: {},
        interfaceHandlers: {},
        inputs: {},
        // error and warning handling
        beforeInput: moduleDef.beforeInput ? moduleDef.beforeInput : _,
        afterInput: moduleDef.afterInput || _,
        warn: moduleDef.warn || _,
        error: moduleDef.error || _,
      }
      // API for modules
      moduleAPI = {
        // dispatch function type used for handlers
        dispatchEv: dispatchEv(ctx),
        toComp: toComp(ctx),
        dispose,
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
        attach,
        // delegated methods
        warn: ctx.warn,
        error: ctx.error,
      }

      // module lifecycle hook: init
      if (moduleDef.beforeInit && !middleFn) {
        await moduleDef.beforeInit(moduleAPI)
      }

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
      ctx.global.hotSwap = true
    }

    let lastModuleRender = ctx.global.moduleRender
    ctx.global.moduleRender = false
    // Root component
    let root = await _nest(ctx, 'Root', component)
    ctx.global.moduleRender = lastModuleRender
    // Root context (level 1)
    ctx.global.rootCtx = root
    // middle function for hot-swapping
    if (middleFn) {
      await middleFn(ctx.global.rootCtx, app)
    }

    // pass initial value to each Interface Handler
    // -- interfaceOrder
    let interfaceOrder = moduleDef.interfaceOrder
    let name
    let errorNotHandler = name => ctx.error(
      'InterfaceHandlers',
      `'$.Root' component has no interface called '${name}', missing interface handler`
    )
    let rootCtx = ctx.global.rootCtx
    if (interfaceOrder) {
      for (let i = 0; name = interfaceOrder[i]; i++) {
        if (ctx.interfaceHandlers[name]) {
          ctx.interfaceHandlers[name].handle(await rootCtx.interfaces[name](ctx.components.Root.state))
        } else {
          return <any> errorNotHandler(name)
        }
      }
    }
    for (name in rootCtx.interfaces) {
      if (interfaceOrder && interfaceOrder.indexOf(name) !== -1) {
        continue // interface evaluated yet
      }
      if (ctx.interfaceHandlers[name]) {
        ctx.interfaceHandlers[name].handle(
          await rootCtx.interfaces[name](ctx.components.Root.state)
        )
      } else {
        return <any> errorNotHandler(name)
      }
    }

    // module lifecycle hook: init
    if (moduleDef.init && !middleFn) {
      await moduleDef.init(moduleAPI)
    }

    return {
      moduleDef,
      // reattach root component, used for hot swapping
      isDisposed: false,
      // root context
      moduleAPI,
      rootCtx: ctx.global.rootCtx,
    }

  }

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

  return await attach(undefined)
}

// generic action input
export const action = (ctx: Context, actions: Actions<any>) => async ([arg1, arg2]: any): Promise<any> => {
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
  if (ctx.global.record) {
    ctx.global.records.push({ id: ctx.id, actionName: name, value })
    ;(window as any).lastCtxAct = ctx
  }
  let result = await execute(ctx, actions[name](value))
  return result
}

// generic execute input
export const executeInput = (ctx: Context) => async (executable: GenericExecutable<any>): Promise<any> => {
  return await execute(ctx, executable)
}

// generic execute input
export const SetAction: Action<any> = ([name, value]): any => s => {
  s[name] = value
  return s
}

export const AddComp = (compFn): Action<any> => (compArgs?: any): any => s => {
  let [name, component] = compFn(s._compCounter, compArgs)
  s._nest[name] = component
  s._compCounter++
  s._compUpdated = true
  return s
}

export const _removeAction: Action<any> = (name): any => s => {
  delete s._nest[name]
  s._compUpdated = true
  return s
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
