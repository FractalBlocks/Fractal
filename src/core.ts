import { Stream, newStream } from './stream'
import { InterfaceMsg } from './interface'

export interface Component {
  // component name, used for debugging
  name: string
  // log all
  log?: boolean
  logAll?: boolean
  // the changing stuff (AKA variables)
  state (params: { key: string }): any
  // dispatchers for actions and tasks
  inputs?: Inputs
  // unique way to change the state
  actions?: {
    [actionName: string]: Action
  }
  // a way to suscribe to external events and perform continous side effects (recalculated on every state change)
  interfaces: {
    [interfaceName: string]: Interface
  }
  // other components
  components?: {
    [name: string]: Component
  }
  // lifecycle hooks
  onInit? (ctx: Context): void
}

export interface Inputs {
  (ctx: Context): {
    [name: string]: Input
  }
}

export interface Input {
  (data: any): Update | void | Task
}

export interface Action {
  (data: any): Update
}

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1: string // task function
  2: Object // task data
}

// is the data of an event, refers to some event of a component - Comunications stuff
export interface EventData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: EventFunction // a dispatcher function is optional
}

// dispatcher data comes from an interface / task handler as a result of processing EventData (from a event) - Comunications stuff
export interface DispatchData extends Array<any> {
  0: string // component index identifier
  1: string // input name
  2?: any // data from an interface / task handler ( result of EventFunction )
}

/* function that can be serialized securely, is pure and should not have contextual dependencies,
   all this stuff allow to serialize communication between root component and handlers, this means you can execute a root component in a worker (even remotely in a host computer)
   and handlers still dispatch inputs, a solution for serializing event callbacks.
   this function is executed by interface / task handlers and his result is passed as a value to the dispatched component event of DispatchData
 Event Flow:
  - EventData (from component interface / task) comes with some data depending on the context
  - If needed, some handy / fancy CHANNEL serialize and transmit it
  - External things occurs and the EventFunction are excecuted (if exists) giving DispatchData as a result
  - If EventData has transferred via CHANNEL, the DispatchData is returned via this CHANNEL
  - the interface / task handler pass DispatchData to dispatch function
  - dispatch function fires the event in the respective component
 */
export type EventFunction = {
  (eventObject: Object): any
}

export interface Update {
  (state: any): any
}

export interface Interface {
  (ctx: Context, state): InterfaceMsg
}

export interface Context {
  // Namespace for component
  id: string
  do: { // execute a Task or an Update (side efects)
    (executable: Executable): void
  }
  // global component index
  components: ComponentIndex
  // error and warning delegation
  warn: {
    (source: string, description: string): void
  }
  error: {
    (source: string, description: string): void
  }
}

export interface ComponentIndex {
  [id: string]: ComponentSpace
}

// contextualized space in the component index
export interface ComponentSpace {
  state: any
  inputs: {
    [name: string]: Input
  }
}

export type Executable = Update | Task

export interface CtxInterface {
  state: InterfaceMsg
}
