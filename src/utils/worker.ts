import { InterfaceHandler } from '../interface'

declare var self: any

export const workerInterface: InterfaceHandler = (name: string) => mod => {
  let lastValue
  let subscriber = value => {
    lastValue = value
    self.postMessage([name, 'value', value])
  }

  return {
    state$: undefined,
    attach: stream$ => {
      stream$.subscribe(subscriber)
      subscriber(stream$.get())
      self.postMessage([name, 'attach'])
    },
    reattach: stream$ => {
      stream$.subscribe(subscriber)
      subscriber(stream$.get())
      self.postMessage([name, 'reattach'])
    },
    dispose: () => {
      self.postMessage([name, 'dispose'])
    },
  }
}
