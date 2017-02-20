import { InterfaceHandler } from '../interface'

declare var self: any

export const workerInterface: InterfaceHandler = (name: string) => mod => {
  return {
    state: undefined,
    handle: value => {
      self.postMessage(['interface', name, 'value', value])
    },
    dispose: () => {
      self.postMessage(['interface', name, 'dispose'])
    },
  }
}

export function runWorker (p: any) {

}

