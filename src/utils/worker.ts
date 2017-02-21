import { InterfaceHandler, InterfaceFunction, InterfaceHandlerObject } from '../interface'
import { TaskFunction } from '../task'
import { Component, DispatchData } from '../core'
import { ModuleAPI } from '../module'

declare var self: any

export const workerInterfaces = (names: string[]) => (mod: ModuleAPI) => {

  self.onmessage = ev => {
    let data = ev.data
    if (data[0] === 'dispatch') {
      return mod.dispatch(data[1])
    }
  }

  let interfaceObjects = {}

  for (let i = 0, len = names.length; i < len; i++) {
    interfaceObjects[names[i]] = {
      state: undefined,
      handle: value => {
        self.postMessage(['interface', names[i], 'value', value])
      },
      dispose: () => {
        self.postMessage(['interface', names[i], 'dispose'])
      },
    }
  }

  return interfaceObjects
}

export interface WorkerModuleDef {
  worker: any
  log?: boolean
  logAll?: boolean
  tasks?: {
    [name: string]: TaskFunction
  }
  interfaces: {
    [name: string]: InterfaceFunction
  }
  warn: {
    (source, description): void
  }
  error: {
    (source, description): void
  }
}

export function runWorker (def: WorkerModuleDef) {
  let worker = new def.worker()
  let interfaceObjects: { [name: string]: InterfaceHandlerObject } = {}

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

  for (let i = 0, names = Object.keys(def.interfaces), len = names.length ; i < len; i++) {
    interfaceObjects[names[i]] = def.interfaces[names[i]](moduleAPI)
  }

  worker.onmessage = ev => {
    let data = ev.data
    switch (data[0]) {
      case 'interface':
        if (data[2] === 'value') {
          return interfaceObjects[data[1]].handle(data[3])
        }
        if (data[2] === 'dispose') {
          return interfaceObjects[data[1]].dispose()
        }
    }
  }

}
