import {
  Handler,
  HandlerInterfaceIndex,
  HandlerObject,
  Component,
  EventData,
  ModuleAPI,
} from '../src'

declare var self: WorkerAPI

export interface WorkerAPI {
  postMessage (value: any): void
  onmessage? (ev: WorkerEvent): void
}

export interface WorkerEvent {
  data: any
}

export const workerHandler = (type: 'interface' | 'task' | 'group', name: string, workerAPI?: WorkerAPI) => (mod: ModuleAPI) => {
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  let _self = workerAPI ? workerAPI : self
  return (source: string, description: string) => {
    _self.postMessage(['log', type, source, description])
  }
}

// receives messages from runWorker
export const workerListener = (mod: ModuleAPI, workerAPI?: WorkerAPI) => {
  /* istanbul ignore next */
  let _self = workerAPI ? workerAPI : self
  // allows to dispatch inputs from the main thread
  _self.onmessage = ev => {
    let data = ev.data
    switch (data[0]) {
      case 'dispatch':
        mod.dispatch(data[1])
        /* istanbul ignore next */
        break
      case 'setGroup':
        mod.setGroup(data[1], data[2], data[3])
        /* istanbul ignore next */
        break
      case 'dispose':
        _self.postMessage(['dispose'])
        mod.dispose()
        /* istanbul ignore next */
        break
      case 'merge':
        // not implemented yet, should deserialize a component with a safe eval
        mod.error('workerListener', `unimplemented method`)
        /* istanbul ignore next */
        break
      case 'mergeAll':
        // not implemented yet, should deserialize a list of components with a safe eval
        mod.error('workerListener', `unimplemented method`)
        /* istanbul ignore next */
        break
      case 'unmerge':
        // not implemented yet, should deserialize a component with a safe eval
        mod.error('workerListener', `unimplemented method`)
        /* istanbul ignore next */
        break
      case 'unmergeAll':
        // not implemented yet, should deserialize a list of components with a safe eval
        mod.error('workerListener', `unimplemented method`)
        /* istanbul ignore next */
        break
      /* istanbul ignore next */
      default:
        mod.error('workerListener', `unknown message type recived from worker: ${data.join(', ')}`)
    }
  }
}

export interface WorkerModuleDef {
  worker: any
  log?: boolean
  logAll?: boolean
  groups?: HandlerInterfaceIndex
  tasks?: HandlerInterfaceIndex
  interfaces: HandlerInterfaceIndex
  warn?: {
    (source, description): void
  }
  error?: {
    (source, description): void
  }
  destroy? (mod: ModuleAPI): void
}

export interface WorkerModule {
  worker: WorkerAPI
  moduleAPI: ModuleAPI
  groupObjects: { [name: string]: HandlerObject }
  taskObjects: { [name: string]: HandlerObject }
  interfaceObjects: { [name: string]: HandlerObject }
}

export function runWorker (def: WorkerModuleDef): WorkerModule {
  let worker: WorkerAPI = def.worker

  let groupObjects: { [name: string]: HandlerObject } = {}
  let taskObjects: { [name: string]: HandlerObject } = {}
  let interfaceObjects: { [name: string]: HandlerObject } = {}

  /* istanbul ignore next */
  let reattach = comp => {
    def.error('reattach', 'unimplemented method')
  }

  // API for modules
  let moduleAPI: ModuleAPI = {
    // dispatch function type used for handlers
    dispatch: (eventData: EventData) => worker.postMessage(['dispatch', eventData]),
    dispose,
    reattach,
    // merge a component to the component index
    merge: (name: string, component: Component) => worker.postMessage(['merge', name, component]),
    // merge many components to the component index
    mergeAll: (components: { [name: string]: Component }) => worker.postMessage(['mergeAll', components]),
    // unmerge a component to the component index
    unmerge: (name: string) => worker.postMessage(['unmerge', name]),
    // unmerge many components to the component index
    unmergeAll: (components: string[]) => worker.postMessage(['unmergeAll', components]),
    // delegated methods
    setGroup: (id, name, group) => worker.postMessage(['setGroup', id, name, group]),
    warn: def.warn,
    error: def.error,
  }
  /* istanbul ignore else */
  if (def.groups) {
    for (let i = 0, names = Object.keys(def.groups), len = names.length ; i < len; i++) {
      groupObjects[names[i]] = def.groups[names[i]](moduleAPI)
    }
  }
  /* istanbul ignore else */
  if (def.tasks) {
    for (let i = 0, names = Object.keys(def.tasks), len = names.length ; i < len; i++) {
      taskObjects[names[i]] = def.tasks[names[i]](moduleAPI)
    }
  }
  /* istanbul ignore else */
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
          interfaceObjects[data[1]].handle(data[3])
          /* istanbul ignore next */
          break
        }
        /* istanbul ignore else */
        if (data[2] === 'dispose') {
          interfaceObjects[data[1]].dispose()
          /* istanbul ignore next */
          break
        }
      case 'task':
        /* istanbul ignore else */
        if (data[2] === 'handle') {
          taskObjects[data[1]].handle(data[3])
          /* istanbul ignore next */
          break
        }
        /* istanbul ignore else */
        if (data[2] === 'dispose') {
          taskObjects[data[1]].dispose()
          /* istanbul ignore next */
          break
        }
      case 'group':
        /* istanbul ignore else */
        if (data[2] === 'handle') {
          groupObjects[data[1]].handle(data[3])
          /* istanbul ignore next */
          break
        }
        /* istanbul ignore else */
        if (data[2] === 'dispose') {
          groupObjects[data[1]].dispose()
          /* istanbul ignore next */
          break
        }
      case 'log':
        /* istanbul ignore else */
        if (moduleAPI[data[1]]) {
          moduleAPI[data[1]](data[2], data[3])
          /* istanbul ignore next */
          break
        }
      case 'dispose':
        if (def.destroy) {
          def.destroy(moduleAPI)
          /* istanbul ignore next */
        }
        break
      /* istanbul ignore next */
      default:
        moduleAPI.error('runWorker', `unknown message type recived from worker: ${data.join(', ')}`)
    }
  }

  function dispose () {
    worker.postMessage(['dispose'])
  }

  return {
    worker,
    moduleAPI,
    groupObjects,
    taskObjects,
    interfaceObjects,
  }
}
