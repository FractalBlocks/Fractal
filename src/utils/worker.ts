import { Handler, HandlerInterface, HandlerObject } from '../handler'
import { Component, DispatchData } from '../core'
import { ModuleAPI } from '../module'

declare var self: WorkerAPI

export interface WorkerAPI {
  postMessage: {
    (value: any): void
  }
  onmessage?: {
    (ev: WorkerEvent): void
  }
}

export interface WorkerEvent {
  data: any
}

export const workerHandler = (type: 'interface' | 'task', name: string, workerAPI?: WorkerAPI) => (mod: ModuleAPI) => {
  let _self = workerAPI ? workerAPI : self
  return {
    state: undefined,
    handle: value => {
      _self.postMessage([type, name, 'handle', value])
    },
    dispose: () => {
      _self.postMessage([type, name, 'dispose'])
    },
  }
}

export const workerLog = (type: 'warn' | 'error', workerAPI?: WorkerAPI) => {
  let _self = workerAPI ? workerAPI : self
  return (source: string, description: string) => {
    _self.postMessage(['log', type, source, description])
  }
}

export interface WorkerModuleDef {
  worker: any
  log?: boolean
  logAll?: boolean
  tasks?: {
    [name: string]: HandlerInterface
  }
  interfaces: {
    [name: string]: HandlerInterface
  }
  warn?: {
    (source, description): void
  }
  error?: {
    (source, description): void
  }
}

export interface WorkerModule {
  worker: WorkerAPI
  taskObjects: { [name: string]: HandlerObject }
  interfaceObjects: { [name: string]: HandlerObject }
}

export function runWorker (def: WorkerModuleDef): WorkerModule {
  let worker: WorkerAPI = def.worker

  let taskObjects: { [name: string]: HandlerObject } = {}
  let interfaceObjects: { [name: string]: HandlerObject } = {}

  // API for modules
  let moduleAPI: ModuleAPI = {
    // dispatch function type used for handlers
    dispatch: (dispatchData: DispatchData) => worker.postMessage(['dispatch', dispatchData]),
    // merge a component to the component index
    merge: (name: string, component: Component) => worker.postMessage(['merge', name, component]),
    // merge many components to the component index
    mergeAll: (components: { [name: string]: Component }) => worker.postMessage(['mergeAll', components]),
    // unmerge a component to the component index
    unmerge: (name: string) => worker.postMessage(['unmerge', name]),
    // unmerge many components to the component index
    unmergeAll: (components: string[]) => worker.postMessage(['unmergeAll', components]),
    // delegated methods
    warn: def.warn,
    error: def.error,
  }

  if (def.tasks) {
    for (let i = 0, names = Object.keys(def.tasks), len = names.length ; i < len; i++) {
      taskObjects[names[i]] = def.tasks[names[i]](moduleAPI)
    }
  }
  if (def.interfaces) {
    for (let i = 0, names = Object.keys(def.interfaces), len = names.length ; i < len; i++) {
      interfaceObjects[names[i]] = def.interfaces[names[i]](moduleAPI)
    }
  }

  worker.onmessage = ev => {
    let data = ev.data
    switch (data[0]) {
      case 'interface':
        /* istanbul ignore else */
        if (data[2] === 'handle') {
          return interfaceObjects[data[1]].handle(data[3])
        }
        if (data[2] === 'dispose') {
          return interfaceObjects[data[1]].dispose()
        }
        moduleAPI.error('runWorker', 'wrong interface method')
        break
      case 'task':
        if (data[2] === 'handle') {
          return taskObjects[data[1]].handle(data[3])
        }
        if (data[2] === 'dispose') {
          return taskObjects[data[1]].dispose()
        }
        moduleAPI.error('runWorker', 'wrong interface method')
        break
      case 'log':
        if (moduleAPI[data[1]]) {
          moduleAPI[data[1]](data[2], data[3])
        }
        break
      default:
        moduleAPI.error('runWorker', 'unknown message type recived from worker')
        break
    }
  }

  return {
    worker,
    taskObjects,
    interfaceObjects,
  }
}
