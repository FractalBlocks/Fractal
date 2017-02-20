import { InterfaceMsg, InterfaceHandlerFunction } from './interface'
import { Task, TaskRunner } from './task'
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
  // the changing stuff (AKA variables)
  state (params: { key: string }): any
  // dispatchers for actions and tasks
  inputs?: Inputs
  // unique way to change the state
  actions?: {
    [name: string]: Action
  }
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: {
    [name: string]: Interface
  }
  // lifecycle hooks: init, destroy
  hooks?: Hooks
}

export interface Hooks {
  [name: string]: {
    (ctx: Context): void
  }
}

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
export interface InputData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // a dispatcher function / value is optional
}

// dispatcher data comes from an interface / task handler as a result of processing EventData (from a event) - Comunications stuff
export interface DispatchData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // data from an interface / task handler ( result of function or value )
}

/* function that can be serialized securely, is pure and should not have contextual dependencies,
   all this stuff allow to serialize communication between root component and handlers, this means you can execute a root component in a worker (even remotely in a host computer)
   and handlers still dispatch inputs, a solution for serializing event callbacks.
   this function is executed by interface / task handlers and his result is passed as a value to the dispatched component event of DispatchData
 Event Flow:
  - InputData (from component interface / task) comes with some data depending on the context
  - If needed, some handy / fancy CHANNEL serialize and transmit it
  - External things occurs and the function (InputData[2]) are excecuted passing it the event data (if exists, if not the value is taken) giving DispatchData as a result
  - If EventData has transferred via CHANNEL, the DispatchData is returned via this CHANNEL
  - the interface / task handler pass DispatchData to dispatch function
  - dispatch function fires the input in the respective component

 The objective of this flow is allow handlers to be excecuted in workers or even remotely o.O
 */

export interface Update {
  (state: any): any
}

export interface Interface {
  (ctx: Context, state): InterfaceMsg
}

// describes an excecution context
export interface Context {
  // Namespace for component
  id: string
  // global component index
  components: ComponentSpaceIndex
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  warnLog: any[]
  error: {
    (source: string, description: string): void
  }
  errorLog: any[]
  taskRunners: {
    [name: string]: TaskRunner
  }
  interfaceHandlerFunctions: {
    [name: string]: InterfaceHandlerFunction
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
  state: InterfaceMsg
}
