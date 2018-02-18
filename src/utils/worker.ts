import {
  HandlerInterfaceIndex,
  HandlerObject,
  ModuleAPI,
  Context,
  InputData,
} from '../core'

declare var self: WorkerAPI

export interface WorkerAPI {
  postMessage (value: any): void
  onmessage? (ev: WorkerEvent): void
}

export interface WorkerEvent {
  data: any
}

export interface SyncQueue {
  queue: Waiter[]
  addWaiter(Waiter): void
  next(data): void
}

export interface Waiter {
  (data): boolean
}

export function makeSyncQueue (): SyncQueue {
  let queue: Waiter[] = []
  return {
    queue,
    addWaiter (waiter) {
      queue.push(waiter)
    },
    next (data) {
      if (queue[0] && queue[0](data)) {
        queue.shift()
      }
    },
  }
}

export const workerHandler = (type: 'interface' | 'task' | 'group', name: string, syncQueue: SyncQueue, workerAPI?: WorkerAPI) => (mod: ModuleAPI) => {
  let _self = workerAPI ? workerAPI : self
  return {
    state: undefined,
    handle: async (id, value) => {
      _self.postMessage([type, name, 'handle', id, value])
      if (type === 'group') {
        return new Promise<any>((resolve) => {
          syncQueue.addWaiter(data => {
            if (data[0] === 'setGroup') {
              resolve()
              return true
            }
          })
        })
      }
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

// receives messages from runWorker
export const workerListener = (syncQueue: SyncQueue, workerAPI?: WorkerAPI) => (mod: ModuleAPI) => {
  let _self = workerAPI ? workerAPI : self
  // allows to dispatch inputs from the main thread
  _self.onmessage = ev => {
    let data = ev.data
    switch (data[0]) {
      case 'dispatchEv':
        mod.dispatchEv(data[1], data[2])
        break
      case 'toComp':
        mod.toComp(data[1], data[2], data[3])
        break
      case 'setGroup':
        mod.setGroup(data[1], data[2], data[3])
        break
      case 'dispose':
        mod.dispose()
        _self.postMessage(['dispose'])
        break
      case 'nest':
        // not implemented yet, should deserialize a component with a safe eval
        mod.error('workerListener', `unimplemented method`)
        break
      case 'nestAll':
        // not implemented yet, should deserialize a list of components with a safe eval
        mod.error('workerListener', `unimplemented method`)
        break
      case 'unnest':
        // not implemented yet, should deserialize a component with a safe eval
        mod.error('workerListener', `unimplemented method`)
        break
      case 'unnestAll':
        // not implemented yet, should deserialize a list of components with a safe eval
        mod.error('workerListener', `unimplemented method`)
        break
      default:
        mod.error('workerListener', `unknown message type recived from worker: ${data.join(', ')}`)
    }
    syncQueue.next(data)
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
  // not implemented yet
  // hooks for inputs
  beforeInput? (ctxIn: Context, inputName: string, data: any): void
  afterInput? (ctxIn: Context, inputName: string, data: any): void
}

export interface WorkerModule {
  worker: WorkerAPI
  moduleAPI: ModuleAPI
  groupObjects: { [name: string]: HandlerObject }
  taskObjects: { [name: string]: HandlerObject }
  interfaceObjects: { [name: string]: HandlerObject }
}

export async function runWorker (def: WorkerModuleDef): Promise<WorkerModule> {
  let worker: WorkerAPI = def.worker

  let groupObjects: { [name: string]: HandlerObject } = {}
  let taskObjects: { [name: string]: HandlerObject } = {}
  let interfaceObjects: { [name: string]: HandlerObject } = {}

  let attach: any = async comp => {
    def.error('reattach', 'unimplemented method')
  }

  // API for modules
  let moduleAPI: ModuleAPI = {
    // dispatch function type used for handlers
    dispatchEv: async (event: any, iData: InputData) => worker.postMessage(['dispatchEv', event, iData]),
    toComp: async (id: string, inputName: string, data: any) =>
      worker.postMessage(['toComp', id, inputName, data]),
    dispose,
    attach,
    // delegated methods
    setGroup: (id, name, group) => worker.postMessage(['setGroup', id, name, group]),
    warn: def.warn,
    error: def.error,
  }
  if (def.groups) {
    for (let i = 0, names = Object.keys(def.groups), len = names.length ; i < len; i++) {
      groupObjects[names[i]] = await (await def.groups[names[i]])(moduleAPI)
    }
  }
  if (def.tasks) {
    for (let i = 0, names = Object.keys(def.tasks), len = names.length ; i < len; i++) {
      taskObjects[names[i]] = await (await def.tasks[names[i]])(moduleAPI)
    }
  }
  if (def.interfaces) {
    for (let i = 0, names = Object.keys(def.interfaces), len = names.length ; i < len; i++) {
      interfaceObjects[names[i]] = await (await def.interfaces[names[i]])(moduleAPI)
    }
  }

  worker.onmessage = async ev => {
    let data = ev.data
    switch (data[0]) {
      case 'interface':
        if (data[2] === 'handle') {
          await interfaceObjects[data[1]].handle('Root', data[3])
          break
        }
        if (data[2] === 'dispose') {
          interfaceObjects[data[1]].dispose()
          break
        }
      case 'task':
        if (data[2] === 'handle') {
          await taskObjects[data[1]].handle(data[3], data[4])
          break
        }
        if (data[2] === 'dispose') {
          await taskObjects[data[1]].dispose()
          break
        }
      case 'group':
        if (data[2] === 'handle') {
          await groupObjects[data[1]].handle(data[3], data[4])
          break
        }
        if (data[2] === 'dispose') {
          groupObjects[data[1]].dispose()
          break
        }
      case 'log':
        if (moduleAPI[data[1]]) {
          moduleAPI[data[1]](data[2], data[3])
          break
        }
      case 'dispose':
        if (def.destroy) {
          def.destroy(moduleAPI)
        }
        break
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
