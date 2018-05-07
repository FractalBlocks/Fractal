// All in one file example
import { Component, getStyle, Actions, StyleGroup, run, Inputs, workerHandler, makeSyncQueue, workerListener } from '../core'
import { h, View } from '../interfaces/view'

// Component

const state = {
  count: 0,
}

type S = typeof state

const inputs: Inputs<S> = (s, F) => ({
  inc: async () => {
    await F.toAct('Inc')
    if (s.count < 10000) {
      setImmediate(() => {
        F.toIn('inc')
      })
    }
  },
})

const actions: Actions<S> = {
  Inc: () => s => {
    s.count++
  },
}

const view: View<S> = async (s, F) => {
  const style = getStyle(F)
  return h('div', {
    class: style('base'),
    on: { click: F.in('inc') },
  }, 'Count ' + s.count)
}

const style: StyleGroup = {
  base: {
    color: 'green',
    fontSize: '40px',
  },
}

const Root: Component<any> = {
  state,
  inputs,
  actions,
  interfaces: { view },
  groups: { style },
}

const DEV = true

const syncQueue = makeSyncQueue()

run({
  onBeforeInit: workerListener(syncQueue),
  Root,
  record: DEV,
  log: DEV,
  groups: {
    style: workerHandler('group', 'style', syncQueue),
  },
  interfaces: {
    view: workerHandler('interface', 'view', syncQueue),
  },
})
