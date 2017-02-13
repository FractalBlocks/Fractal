import { ModuleAPI } from './module'

// a task executes some kind of side effect (output) - Comunications stuff
export interface Task extends Array<any> {
  0: string // task name
  1?: any // task data
}

export interface TaskHandler {
  (any): TaskFunction
}

// interface function passed via ModuleDef
export interface TaskFunction {
  (mod: ModuleAPI): TaskRunner
}

export interface TaskRunner {
  (any): void
}
