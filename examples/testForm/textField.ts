import { Context, Component, ev } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'TextField'

let state = ({key}) => ({
  key,
  count: 0,
})

let actions = {
  SetValue: (value: string) => state => {
    state.value = value
    return state
  },
}

let inputs = (ctx: Context) => ({
  action: ([value, name]) => actions[name](value), // generic action dispatcher
})

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: name,
  class: { [style.base]: true },
}, [
  h('input', {
    class: { [style.input]: true },
    on: {
      change: ev(ctx, 'action', ['target', 'value'], 'SetValue'),
    },
  }, `${s.count}`),
  h('div', s.value),
])


let styleObj: StyleGroup = {
  base: {
  },
}

let style: any = styleGroup(styleObj, name)


let mDef: Component = {
  name,
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef
