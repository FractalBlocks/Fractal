// All in one file example
import { getStyle, Actions, StyleGroup, run, Inputs, Interfaces, clone } from '../core'
import { h, View, viewHandler } from '../interfaces/view'
import { styleHandler } from '../groups/style'

namespace ChildComp {

  export const state = {
    count: 0,
  }

  export type S = typeof state

  export const inputs: Inputs = F => ({
    inc: async name => {
      await F.toAct('Inc')
      await F.toIt('changed', F.stateOf().count)
    },
    changed: async value => {},
  })

  export const actions: Actions<S> = {
    Inc: () => s => {
      s.count++
      return s
    },
  }

  const view: View<S> = F => async s => {
    const style = getStyle(F)
    return h('div', {
      key: F.ctx.name,
      class: style('base'),
      on: { click: F.in('inc', F.ctx.name) },
    }, 'Count ' + s.count)
  }

  export const interfaces: Interfaces = { view }

  const style: StyleGroup = {
    base: {
      color: 'green',
      fontSize: '40px',
    },
  }

  export const groups = { style }

}

namespace Root {

  export const state = {
    count: 0,
    _nest: {
      C1: clone(ChildComp),
      C2: clone(ChildComp),
      C3: clone(ChildComp),
      C4: clone(ChildComp),
      A_1: clone(ChildComp),
      A_2: clone(ChildComp),
      A_3: clone(ChildComp),
    },
  }

  export type S = typeof state

  export const inputs: Inputs = F => ({
    $C3_changed: async n => console.log('Individual propagation ', n),
    $A_changed: async n => console.log('Groupal propagation ', n),
    $_changed: async n => console.log('Global propagation ', n),
  })

  export const actions: Actions<S> = {}

  const view: View<S> = F => async s => {
    const style = getStyle(F)
    return h('div', {
      class: style('base'),
    },
      await F.vws(['C1', 'C2', 'C3', 'C4', 'A_1', 'A_2', 'A_3'])
    )
  }

  export const interfaces: Interfaces = { view }

  const style: StyleGroup = {
    base: {},
  }

  export const groups = { style }

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
  // ...logFns,
})
