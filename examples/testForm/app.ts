import { Context, Component, stateOf, interfaceOf } from '../../src'
import { styleGroup, StyleGroup } from '../../utils/style'
import { ViewInterface } from '../../interfaces/view'
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

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    interfaceOf(ctx, 'user', 'view'),
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

