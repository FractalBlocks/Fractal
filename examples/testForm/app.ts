import { Context, Component, stateOf, interfaceOf } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'
import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  user: require('./textField').default,
}

let state = ({key}) => ({
  key,
})

let actions = {
}

let inputs = (ctx: Context) => ({
})

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: name,
  class: { [style.base]: true },
}, [
  interfaceOf(ctx, 'user', 'view'),
])

let style: any = styleGroup({
  base: {
  },
}, name)


let mDef: Component = {
  name,
  state,
  components,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

