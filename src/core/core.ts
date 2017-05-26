import { HandlerMsg, HandlerObject } from './handler'

export type Identifier = number | string

export interface Component<S> {
  // component name, used for debugging
  name: Identifier
  // log all
  log?: boolean
  logAll?: boolean
  // composition
  components?: Components
  // child component definitions, used for referencing dynamic components in hot-swaping
  defs?: Components
  // general purpose groups, used for styles
  groups?: {
    [name: string]: Group,
  },
  // the changing stuff (AKA variables)
  state?: S
  // dispatchers for actions and tasks
  inputs?: Inputs<S>
  // unique way to change the state
  actions?: Actions<S>
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: Interfaces
  // lifecycle hooks: init, destroy
  init? : Hook
  destroy? : Hook
}

export interface Components {
  [name: string]: Component<any>
}

export interface Interfaces {
  [name: string]: Interface<any, any>
}

export interface Hook {
  (ctx: Context): void
}

export type Group = any

export interface Inputs<S> {
  (ctx: Context): InputIndex<S>
}

export interface InputIndex<S> {
  [name: string]: Input<S>
}

export interface Input<S> {
  (data?: any): Update<S> | Task | Executable<S>[] | void
}

export interface Action<S> {
  (data?: any): Update<S>
}

export interface Actions<S> {
  [name: string]: Action<S>
}

export interface EventOptions {
  default?: boolean
  propagate?: boolean
}

// is the data of an event, refers to some event of a component - Comunications stuff
/* NOTE: function strings can be:
  - '*': which means, serialize all the event object
  - 'other': which means, serialize the 'other' attribute of the event object
*/
export interface InputData extends Array<any> {
  0: Identifier // component index identifier
  1: string // input name
  2?: any // context parameter
  3?: any // a param function string / value is optional
  4?: EventOptions
}

// event data comes from an interface / task handler as a result of processing InputData - Comunications stuff
export interface EventData extends Array<any> {
  0: Identifier // component index identifier
  1: string // input name
  2?: any // context parameter from InputData (contextual)
  3?: any // data from an interface / task handler ( result of function or value )
  4?: 'pair' | 'fn' | 'context'
}

/* function string makes easy to serialize InputData, if '*' the data fetched are the whole event object, if 'other' extract 'other' property from event object
   all this stuff allow to serialize communication between root component and handlers, this means you can execute a root component in a worker (even remotely in a host computer)
   and handlers still dispatch inputs, a solution for serializing event callbacks.
   this function is executed by interface / task handlers and his result is passed as a value to the dispatched component input passing as argument EventData
 Event Flow:
  - InputData (from component interface / task) comes with some data depending on the context
  - If needed, some handy / fancy CHANNEL serialize and transmit it
  - External things occurs, if InputData[3] is true the function string (InputData[2]) are excecuted, if not the value is taken, giving EventData as event data
  - If EventData has transferred via CHANNEL, the EventData is returned via this CHANNEL
  - the interface / task handler pass EventData to dispatch function
  - dispatch function fires the input in the respective component passing the event data

 The objective of this flow is allow handlers to be excecuted in workers or even remotely o.O
 */

export interface Update<S> {
  (state: S): S
}

export interface Interface<Type, S>{
  (ctx: Context, state: S): Type
}

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1?: HandlerMsg // task data
}

// describes an excecution context
export interface Context {
  // name for that component in the index
  id: Identifier
  // sintax sugar: the name is the last part of the id (e.g. the id is Main$child the name is child)
  name: Identifier
  // groups of the component (related to a component space)
  groups: {
    [name: string]: Group,
  },
  // global component index
  components: ComponentSpaceIndex
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
    // global is scoped by it's creation in nest function
    // and only used for initialization for nest function and notifyInterfaceHandlers
    initialized: boolean
  },
  // input hooks delegation
  beforeInput? (ctxIn: Context, inputName: string, data: any): void
  afterInput? (ctxIn: Context, inputName: string, data: any): void
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  error: {
    (source: string, description: string): void
  },
}

export interface ComponentSpaceIndex {
  [id: string]: ComponentSpace
}

// contextualized space in the component index
export interface ComponentSpace {
  ctx: Context
  // META: is statically composed?
  isStatic: boolean
  state: any
  inputs: InputIndex<any>
  // component index for dynamic handling (new and dispose)
  components: {
    [name: string]: true
  }
  def: Component<any>
}

export type Executable<S> = Update<S> | Task

export interface CtxInterface {
  state: HandlerMsg
}
