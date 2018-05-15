require('setimmediate') // Polyfill setImmediate
import {
  Component,
  Update,
  Context,
  Components,
  InputData,
  action,
  SetAction,
  _removeAction,
  clone,
  HandlerInterface,
  HandlerObject,
  makeInterfaceHelpers,
  dispatchEv,
  toComp,
  makeInputHelpers,
  State,
  makeImmutableState,
  dispatch,
  EventData,
} from '.'
import {
  makeEventBus,
  Off,
  Emit,
  On,
} from 'pullable-event-bus'

export interface ModuleDef {
  Root: Component<any>
  record?: boolean
  log?: boolean
  render?: boolean // initial render flag
  active?: boolean
  // Handlers
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  interfaceOrder?: Array<string>
  // Lifecycle hooks for modules
  onBeforeInit? (mod: ModuleAPI): Promise<void>
  onInit? (mod: ModuleAPI): Promise<void>
  onBeforeDestroy? (mod: ModuleAPI): Promise<void>
  onDestroy? (mod: ModuleAPI): Promise<void>
  // Hooks for inputs
  beforeInput? (ctxIn: Context<any>, inputName: string, data: any): void
  afterInput? (ctxIn: Context<any>, inputName: string, data: any): void
  // Callbacks for log messages
  warn? (source: string, description: string): Promise<void>
  error? (source: string, description: string): Promise<void>
}

// a gap is defined with undefined (optional)
export const _ = undefined

export interface HandlerInterfaceIndex {
  [name: string]: HandlerInterface | Promise<HandlerInterface>
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
  rootCtx: Context<any>
}

// API from module to handlers
export interface ModuleAPI {
  on: On,
  off: Off,
  emit: Emit,
  dispatchEv (event: any, iData: InputData): Promise<void>
  dispatch (eventData: EventData): Promise<void>
  toComp (id: string, inputName: string, data?: any): Promise<void>
  destroy (): void
  attach (comp: Component<any>, app?: Module, middleFn?: MiddleFn): Promise<Module>
  setGroup (id: string, name: string, space: any): void
  task: CtxPerformTask
  warn (source, description): void
  error (source, description): void
}

// MiddleFn is used for merge the states on hot-swaping (reattach)
export interface MiddleFn {
  (
    ctx: Context<any>,
    app: Module
  ): void
}

export const handlerTypes = ['interface', 'task', 'group']

export interface CtxNest {
  (name: string, component: Component<any>, isStatic?: boolean): void
}

async function _nest <S extends State>(ctx: Context<S>, name: string, component: Component<any>): Promise<Context<S>> {
  if (!component) {
    ctx.error('_nest', `Error when trying to create a component named ${name} in component ${ctx.id}`)
  }
  // namespaced name if is a child
  let id = ctx.id === 'Root' && name === 'Root' ? 'Root' : ctx.id + '$' + name
  // state default
  component.state = component.state || {}
  component.state._nest = component.state._nest || {}
  component.state._compCounter = 0
  // Component state
  const state = clone(component.state)
  // Component context
  let childCtx: Context<S> = {
    id, // the component id
    name,
    groups: {},
    // delegation
    eventBus: ctx.eventBus,
    global: ctx.global,
    components: ctx.components,
    groupHandlers: ctx.groupHandlers,
    interfaceHandlers: ctx.interfaceHandlers,
    taskHandlers: ctx.taskHandlers,
    beforeInput: ctx.beforeInput,
    afterInput: ctx.afterInput,
    warn: ctx.warn,
    error: ctx.error,
    // Component related context
    state,
    inputs: {}, // input helpers needs to be initialized after ComponentSpace, because references
    actions: component.actions,
    interfaces: component.interfaces,
    interfaceHelpers: <any> {},
    interfaceValues: {},
  }
  // Create interface helpers
  childCtx.interfaceHelpers = makeInterfaceHelpers(childCtx)

  ctx.components[id] =  childCtx

  if (component.inputs) {
    childCtx.inputs = component.inputs(
      makeImmutableState(childCtx, childCtx.state),
      makeInputHelpers(childCtx),
    )
  } else {
    childCtx.inputs = {}
  }
  if (component.actions) { // reserved inputs: _action and _return
    if (!childCtx.inputs._action) {
      // action helper enabled by default
      childCtx.inputs._action = action(childCtx, component.actions)
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

  if (childCtx.inputs.onInit && !childCtx.global.hotSwap) {
    // component lifecycle hook: onInit
    await childCtx.inputs.onInit()
  }

  return childCtx
}

async function handleGroups <S>(ctx: Context<S>, component: Component<any>) {
  let space: HandlerObject
  let name
  for (name in component.groups) {
    space = ctx.groupHandlers[name]
    if (space) {
      await space.handle(ctx.id, component.groups[name])
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
export const nestAll = <S extends State>(ctx: Context<S>): CtxNestAll => async (components, isStatic = false) => {
  let name
  for (name in components) {
    await _nest(ctx, name, components[name])
  }
}

export interface CtxUnnest {
  (name?:  string): Promise<void>
}

// remove a component to the component index, if name is not defined destroy the root
export const unnest = <S>(ctx: Context<S>): CtxUnnest => async name => {
  let id = name !== undefined ? ctx.id + '$' + name : ctx.id
  let componentSpace = ctx.components[id]
  if (!componentSpace) {
    return ctx.error('unnest', `there is no component with name '${name}' at component '${ctx.id}'`)
  }
  // decomposition
  let components = componentSpace.components
  if (components) {
    await unnestAll(componentSpace)(Object.keys(componentSpace.state._nest))
  }
  // component lifecycle hook: onDestroy
  if (ctx.inputs.onDestroy && !ctx.global.hotSwap) {
    await ctx.inputs.onDestroy()
  }
  delete ctx.components[id]
}

export interface CtxUnnestAll {
  (components: string[]): Promise<void>
}

// add many components to the component index
export const unnestAll = <S>(ctx: Context<S>): CtxUnnestAll => async components => {
  let _unnest = unnest(ctx)
  for (let i = 0, len = components.length; i < len; i++) {
    await _unnest(components[i])
  }
}

export async function propagate <S>(ctx: Context<S>, inputName: string, data: any) {
  // notifies parent if name starts with $
  let id = ctx.id
  let idParts = (id + '').split('$')
  let componentSpace = ctx.components[id]
  if (idParts.length > 1) {
    // is not root?
    let parentId = idParts.slice(0, -1).join('$')
    let parentSpace = ctx.components[parentId]
    let parentInputName
    let nameParts = componentSpace.name.split('_')
    /** Component Input Listeners
    * - Individual: $CompName_inputName or $GroupName_compName_inputName -> data
    * - Groupal: $GroupName_inputName -> [name, data]
    * - Global: $_inputName -> [name, data]
    */
     // Individual
    parentInputName = `$${componentSpace.name}_${inputName}`
    if (parentSpace.inputs[parentInputName]) {
      await toIn(parentSpace)(parentInputName, data)
    }
    // Groupal
    if (nameParts.length === 2) {
      parentInputName = `$${nameParts[0]}_${inputName}`
      if (parentSpace.inputs[parentInputName]) {
        await toIn(parentSpace)(parentInputName, [nameParts[1], data])
      }
    }
    // Global
    parentInputName = `$_${inputName}`
    if (parentSpace.inputs[parentInputName]) {
      await toIn(parentSpace)(parentInputName, [componentSpace.name, data])
    }
  }
}

export interface CtxToIn {
  (inputName: string, data?): Promise<void>
}

// send a message to an input of a component from itself
export const toIn = <S>(ctx: Context<S>): CtxToIn => {
  let id = ctx.id
  let componentSpace = ctx.components[id]
  return async (inputName, data) => {
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
    await propagate(ctx, inputName, data)
    return result
  }
}

export async function performUpdate <S extends State>(compCtx: Context<S>, update: Update<S>): Promise<void> {
  const state = compCtx.state
  const stateUpdates = await update(state)
  if (stateUpdates) {
    let key
    for (key in stateUpdates) {
      state[key] = stateUpdates[key]
    }
  }
  if (state._compUpdated) {
    compCtx.global.render = false
    let compNames = state._compNames
    let newCompNames = Object.keys(state._nest)
    let newNames = newCompNames.filter(n => compNames.indexOf(n) < 0)
    let removeNames = compNames.filter(n => newCompNames.indexOf(n) < 0)
    for (let i = 0, len = newNames.length; i < len; i++) {
      await _nest(compCtx, newNames[i], state._nest[newNames[i]])
    }
    for (let i = 0, len = removeNames.length; i < len; i++) {
      await unnest(compCtx)(removeNames[i])
    }
    state._compUpdated = false
    state._compNames = newCompNames
    compCtx.global.render = true
  }
  if (compCtx.global.moduleRender && compCtx.global.render) {
    calcAndNotifyInterfaces(compCtx) // root context
  } else {
    compCtx.interfaceValues = {}
  }
}

export interface CtxPerformTask {
  (name: string, data?: any): Promise<any>
}

export function performTask <S>(ctx: Context<S>): CtxPerformTask {
  return (name, data) => {
    if (!ctx.taskHandlers[name]) {
      ctx.error(
        'execute',
        `there are no task handler for '${name}' in component '${ctx.name}' from space '${ctx.id}'`
      )
      return
    }
    return ctx.taskHandlers[name].handle(ctx.id, data)
  }
}

export function calcAndNotifyInterfaces <S>(ctx: Context<S>) {
  // calc and caches interfaces
  let space = ctx.components[ctx.id]
  let idParts = (ctx.id + '').split('$')
  for (let name in space.interfaces) {
    setImmediate(async () => {
      // remove cache of parent component spaces
      let parts = idParts.slice(0)
      for (let i = parts.length - 1; i >=0 ; i--) {
        ctx.components[parts.join('$')].interfaceValues[name] = undefined
        parts.pop()
      }
      // permorms interface recalculation
      let rootSpace = ctx.components.Root
      for (let name in rootSpace.interfaces) {
        if (ctx.interfaceHandlers[name]) {
          ctx.interfaceHandlers[name].handle('Root', await rootSpace.interfaces[name](rootSpace.state, rootSpace.interfaceHelpers))
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
  // root component
  let component: Component<any>
  let moduleAPI: ModuleAPI
  // root context
  let ctx: Context<any>

  // Prevents cross references
  moduleDef = clone(moduleDef)

  // Add event bus as default `ev` task handler
  moduleDef.tasks = moduleDef.tasks ? moduleDef.tasks : {}

  // attach root component
  async function attach (comp: Component<any>, app?: Module, middleFn?: MiddleFn): Promise<Module> {
    // root component, take account of hot swapping
    component = comp ? comp : moduleDef.Root
    // if is hot swapping, do not recalculate context
    // bootstrap context (level 0 in hierarchy)
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
        eventBus: makeEventBus(),
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
        on: ctx.eventBus.on,
        off: ctx.eventBus.off,
        emit: ctx.eventBus.emit,
        // dispatch function type used for handlers
        dispatchEv: dispatchEv(ctx),
        dispatch: dispatch(ctx),
        toComp: toComp(ctx),
        destroy,
        // set a space of a certain component
        setGroup: (id, name, space) => {
          ctx.components[id].groups[name] = space
        },
        attach,
        task: performTask(ctx),
        // delegated methods
        warn: ctx.warn,
        error: ctx.error,
      }

      // module lifecycle hook: onBeforeInit
      if (moduleDef.onBeforeInit && !middleFn) {
        await moduleDef.onBeforeInit(moduleAPI)
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
            ctx[handlerTypes[c] + 'Handlers'][name] = await (await handlers[name])(moduleAPI)
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
          ctx.interfaceHandlers[name].handle(
            'Root',
            await rootCtx.interfaces[name](ctx.components.Root.state, ctx.components.Root.interfaceHelpers)
          )
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
          'Root',
          await rootCtx.interfaces[name](ctx.components.Root.state, ctx.components.Root.interfaceHelpers)
        )
      } else {
        return <any> errorNotHandler(name)
      }
    }

    // module lifecycle hook: onInit
    if (moduleDef.onInit && !middleFn) {
      await moduleDef.onInit(moduleAPI)
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

  async function destroy () {
    if (moduleDef.onBeforeDestroy) {
      await moduleDef.onBeforeDestroy(moduleAPI)
    }
    // destroy all handlers
    let handlers: HandlerObjectIndex
    for (let c = 0, len = handlerTypes.length; c < len; c++) {
      handlers  = ctx[`${handlerTypes[c]}Handlers`]
      let name
      for (name in handlers) {
        await handlers[name].destroy()
      }
    }
    await unnest(ctx.global.rootCtx)()
    ctx = undefined
    this.isDisposed = true
    if (moduleDef.onDestroy) {
      await moduleDef.onDestroy(moduleAPI)
    }
  }

  return await attach(undefined)
}
