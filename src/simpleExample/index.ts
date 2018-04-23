// All in one file example
import { Component, getStyle, Actions, StyleGroup, run, Inputs, logFns } from '../core'
import { h, View, viewHandler } from '../interfaces/view'
import { styleHandler } from '../groups/style'

// Component

const state = {
  count: 0,
}

type S = typeof state

const inputs: Inputs<S> = (s, F) => ({
  inc: async () => {
    await F.toAct('Inc')
    setImmediate(() => {
      F.toIn('inc')
    })
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

run({
  Root,
  record: DEV,
  log: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
})
