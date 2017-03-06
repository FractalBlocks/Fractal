import { Context, Component, ev, execute } from '../../src'
import { action, parent } from '../../utils/component'
import { styleGroup, StyleGroup, placeholderColor } from '../../utils/style'

import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Button'

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    on: { click: ev(parent(ctx), ctx.name + '_click') },
  }, [
    <any> 'Run!!'
  ])
}

const style: StyleGroup = {
  base: {
    padding: '10px',
    fontSize: '22px',
    color: 'white',
    backgroundColor: '#1E4691',
    borderRadius: '2px',
    textAlign: 'center',
  },
}

let mDef: Component = {
  name,
  groups: {
    style,
  },
  inputs: ctx => ({}),
  actions: {},
  interfaces: {
    view,
  },
}

export default mDef
