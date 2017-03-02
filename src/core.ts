import { HandlerMsg, HandlerFunction } from './handler'
import { HandlerObject } from './handler'
import { ModuleAPI } from './module'

export interface Component {
  // component name, used for debugging
  name: string
  // log all
  log?: boolean
  logAll?: boolean
  // composition
  components?: {
    [name: string]: Component
  }
  // general purpose groups, used for styles
  groups?: {
    [name: string]: Group,
  },
  // the changing stuff (AKA variables)
  state (params: { key: string }): any
  // dispatchers for actions and tasks
  inputs: Inputs
  // unique way to change the state
  actions: {
    [name: string]: Action
  }
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: {
    [name: string]: Interface
  }
  // lifecycle hooks: init, destroy
  init? (ctx: Context): void
  destroy? (ctx: Context): void
}

export type Group = any

export interface Inputs {
  (ctx: Context): InputIndex
}

export interface InputIndex {
  [name: string]: Input
}

export interface Input {
  (data: any): Update | Task | Executable[]
}

export interface Action {
  (data: any): Update
}

// is the data of an event, refers to some event of a component - Comunications stuff
/* NOTE: function strings can be:
  - '*': which means, serialize all the event object
  - 'other': which means, serialize the 'other' attribute of the event object
*/
export interface InputData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // if defined param is a value is used as context parameter
  3?: any // a param function string / value is optional
}

// event data comes from an interface / task handler as a result of processing InputData - Comunications stuff
export interface EventData extends Array<any> {
  0: string // component index identifier
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

export interface Update {
  (state: any): any
}

export interface Interface {
  (ctx: Context, state): HandlerMsg
}

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1?: any // task data
}

// describes an excecution context
export interface Context {
  // Namespace for component
  id: string
  // name for that component in the index
  name: string
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
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  error: {
    (source: string, description: string): void
  }
}

export interface ComponentSpaceIndex {
  [id: string]: ComponentSpace
}

// contextualized space in the component index
export interface ComponentSpace {
  ctx: Context
  state: any
  inputs: InputIndex
  // component index for dynamic handling (new and dispose)
  components: {
    [name: string]: true
  }
  def: Component
}

export type Executable = Update | Task

export interface CtxInterface {
  state: HandlerMsg
}
