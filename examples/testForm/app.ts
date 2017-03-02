import { Context, Component, stateOf, interfaceOf, clone } from '../../src'
import { props } from '../../utils/component'
import { styleGroup, StyleGroup } from '../../utils/style'
import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

import textField from './textField'

let name = 'Main'

let components = {
  user: props(textField, { placeholder: 'User' }),
  pass: props(textField, { value: 'asdasd' }),
}

let state = {}

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
    width: '400px',
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

