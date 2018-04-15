import { EventBus } from 'pullable-event-bus'
import { HandlerMsg, HandlerObject } from './handler'
import { InterfaceHelpers } from './interface'
import { InputHelpers } from './input'
import { Module } from './module'

export interface Component<S extends State> {
  // the changing stuff (AKA variables)
  state?: S
  // Inputs are dispatchers of actions and tasks
  inputs?: Inputs<S>
  // unique way to change the state
  actions?: Actions<S>
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: Interfaces
  // general purpose groups, commonly used for styles
  groups?: {
    [name: string]: Group
  }
}

export interface State {
  [prop: string]: any
  _nest?: Components
  _compNames?: string[]
  _compUpdated?: boolean
}

export interface Components {
  [name: string]: Component<any>
}

export interface Interfaces {
  [name: string]: Interface<any, any>
}

export type Group = any

export interface Inputs<S> {
  (s?: S, F?: InputHelpers<S>): InputIndex
}

export interface InputIndex {
  [name: string]: Input
}

export interface Input {
  (data?: any): void
}

export interface Action<S> {
  (data?: any): Update<S> | Promise<Update<S>>
}

export interface Actions<S> {
  [name: string]: Action<S>
}

export interface EventOptions {
  default?: boolean
  listenPrevented?: boolean
  selfPropagated?: boolean // only for global events
}

// is the data of an event, refers to some event of a component - Comunications stuff
/* NOTE: function strings can be:
  - '*': which means, serialize all the event object
  - 'other': which means, serialize the 'other' attribute of the event object
*/
export interface InputData extends Array<any> {
  0: string // component identifier
  1: string // input name
  2?: any // context parameter
  3?: any // a param function string / value is optional
  4?: EventOptions
}

// event data comes from an interface / task handler as a result of processing InputData - Comunications stuff
export interface EventData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // data
}

export interface Update<S> {
  (state: S): Promise<S> | S
}

export interface Interface<Type, S> {
  (state: S, F: InterfaceHelpers<S>): Promise<Type>
}

export interface InterfaceIndex {
  [name: string]:  Interface<any, any>
}

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1?: HandlerMsg // task data
}

// describes an excecution context
export interface Context<S> {
  // name for that component in the index
  id: string
  // sintax sugar: the name is the last part of the id (e.g. the id is Main$child the name is child)
  name: string
  state: S
  inputs: InputIndex
  actions: Actions<any>
  interfaces: InterfaceIndex
  interfaceHelpers: InterfaceHelpers<S>
  interfaceValues: { // caches interfaces
    [name: string]: any
  }
  // groups of the component (related to a component space)
  groups: {
    [name: string]: Group,
  },
  // global component index
  components: ContextIndex<State>
  groupHandlers: {
    [name: string]: HandlerObject
  }
  taskHandlers: {
    [name: string]: HandlerObject
  }
  interfaceHandlers: {
    [name: string]: HandlerObject
  }
  // global flags delegation
  global: {
    // record all actions
    record: boolean
    records: ActionRecord[]
    log: boolean
    // flag for disabling rendering workflow, useful in SSR for performance
    render: boolean
    moduleRender: boolean
    hotSwap: boolean
    // root context delegation
    rootCtx: Context<S>
    // active flag, this flag can stop input excecution (used in hot-swap)
    active: boolean
  },
  eventBus: EventBus,
  // input hooks delegation
  beforeInput? (ctxIn: Context<S>, inputName: string, data: any): void
  afterInput? (ctxIn: Context<S>, inputName: string, data: any): void
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  error: {
    (source: string, description: string): void
  },
}

export interface ActionRecord {
  id: string
  actionName: string
  value: any
}

export interface ContextIndex<S> {
  [id: string]: Context<S>
}

export interface RunModule {
  (root: Component<any>, DEV: boolean, options?, viewCb?): Promise<Module>
}
