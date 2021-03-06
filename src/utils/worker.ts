import {
  HandlerObject,
  ModuleAPI,
  InputData,
  ModuleDef,
  EventData,
  Module,
  run,
  clone,
  handlerTypes,
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
  let waiter
  return {
    state: undefined,
    handle: async (id, value) => {
      if (type === 'group') {
        waiter = new Promise<any>((resolve) => {
          syncQueue.addWaiter(data => {
            if (data[0] === 'setGroup') {
              resolve()
              return true
            }
          })
        })
      }
      _self.postMessage([type, name, 'handle', id, value])
      return waiter
    },
    destroy: () => {
      _self.postMessage([type, name, 'destroy'])
    },
  }
}

export const workerLog = (type: 'warn' | 'error', workerAPI?: WorkerAPI) => {
  let _self = workerAPI ? workerAPI : self
  return (source: string, description: string) => {
    _self.postMessage(['log', type, source, description])
  }
}

// receives messages from runWorker in the WorkerSide
export const createWorkerListener = (syncQueue: SyncQueue, workerAPI?: WorkerAPI): any => (mod: ModuleAPI) => {
  let _self = workerAPI ? workerAPI : self
  // allows to dispatch inputs from the main thread
  _self.onmessage = ev => {
    let data = ev.data
    switch (data[0]) {
      case 'dispatchEv':
        mod.dispatchEv(data[1], data[2])
        break
      case 'dispatch':
        mod.dispatch(data[1])
        break
      case 'toComp':
        mod.toComp(data[1], data[2], data[3])
        break
      case 'setGroup':
        mod.setGroup(data[1], data[2], data[3])
        break
      case 'task':
        mod.task(data[1], data[2])
        break
      case 'destroy':
        mod.destroy()
        _self.postMessage(['destroy'])
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

export interface WorkerModuleDef extends ModuleDef {
  worker: any
  Root: any
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

  // const eventHandlerRegister = {}

  // API for modules (Main Thread)
  let moduleAPI: ModuleAPI = {
    on: (eventName, eventData, pullable) => ['ev', 12],// worker.postMessage(['on', eventName, eventData, pullable]),
    off: descriptor => worker.postMessage(['off', descriptor]),
    emit: (eventName, data) => new Promise(() => {}), // worker.postMessage(['emit', eventName, data]),
    // dispatch function type used for handlers
    dispatchEv: async (event: any, iData: InputData) => worker.postMessage(['dispatchEv', event, iData]),
    dispatch: async (eventData: EventData) => worker.postMessage(['dispatch', eventData]),
    toComp: async (id: string, inputName: string, data: any) =>
      worker.postMessage(['toComp', id, inputName, data]),
    destroy,
    attach,
    // delegated methods
    setGroup: (id, name, group) => worker.postMessage(['setGroup', id, name, group]),
    task: async (name: string, data?: any) => worker.postMessage(['task', name, data]),
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

  let initTrap

  worker.onmessage = async ev => {
    let data = ev.data
    switch (data[0]) {
      case 'initialized':
        initTrap()
        break
      case 'interface':
        if (data[2] === 'handle') {
          await interfaceObjects[data[1]].handle('Root', data[4])
          break
        } else if (data[2] === 'destroy') {
          interfaceObjects[data[1]].destroy()
          break
        }
      case 'task':
        if (data[2] === 'handle') {
          await taskObjects[data[1]].handle(data[3], data[4])
          break
        } else if (data[2] === 'destroy') {
          await taskObjects[data[1]].destroy()
          break
        }
      case 'group':
        if (data[2] === 'handle') {
          await groupObjects[data[1]].handle(data[3], data[4])
          break
        } else if (data[2] === 'destroy') {
          groupObjects[data[1]].destroy()
          break
        }
      case 'log':
        if (moduleAPI[data[1]]) {
          moduleAPI[data[1]](data[2], data[3])
          break
        }
      case 'destroy':
        if (def.onDestroy) {
          def.onDestroy(moduleAPI)
        }
        break
      default:
        moduleAPI.error('runWorker', `unknown message type recived from worker: ${data.join(', ')}`)
    }
  }

  await new Promise(resolve => {
    initTrap = resolve
  })

  function destroy () {
    worker.postMessage(['destroy'])
  }

  return {
    worker,
    moduleAPI,
    groupObjects,
    taskObjects,
    interfaceObjects,
  }
}

export interface ExceptionsObject {
  interfaces: string[]
  tasks: string[]
  groups: string[]
}

export const runInWorker = async (moduleDef: ModuleDef, exceptions?: ExceptionsObject, workerAPI?: WorkerAPI): Promise<Module> => {
  let _self = workerAPI ? workerAPI : self
  const syncQueue = makeSyncQueue()
  const workerModule: ModuleDef = clone(moduleDef)
  const workerListener = createWorkerListener(syncQueue, workerAPI)
  // Inject into onBeforeInit hook
  workerModule.onBeforeInit
    = moduleDef.onBeforeInit
      ? mod => {
        workerListener(mod)
        workerModule.onBeforeInit(mod)
      }
      : workerListener

  // Make a proxy for handler inside the worker for comunicating to the main thread
  let handlerType, handlerName, handlerTypePlural
  for (handlerType of handlerTypes) {
    handlerTypePlural = handlerType + 's'
    for (handlerName in moduleDef[handlerTypePlural]) {
      if (exceptions && exceptions[handlerTypePlural].indexOf(handlerName) === -1 || !exceptions) {
        workerModule[handlerTypePlural][handlerName] = workerHandler(handlerType, handlerName, syncQueue, workerAPI)
      }
    }
  }

  const mod = await run(workerModule)
  _self.postMessage(['initialized'])

  return mod
}
