import { Context, Component, stateOf, interfaceOf } from '../../src'
import { styleGroup, StyleGroup } from '../../utils/style'
import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

import textField from './textField'

let name = 'Main'

function props (component: Component, state): Component {
  let clone = Object.assign({}, component)
  clone.state = Object.assign(clone.state, state)
  return clone
}

let components = {
  user: props(textField, { placeholder: 'User' }),
  pass: textField,
}

let state = ({key}) => ({
  key,
})

let actions = {
}

let inputs = (ctx: Context) => ({
})

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    interfaceOf(ctx, 'user', 'view'),
    interfaceOf(ctx, 'pass', 'view'),
  ])
}


let style: any = {
  base: {
  },
}


let mDef: Component = {
  name,
  groups: {
    style,
  },
  state,
  components,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

