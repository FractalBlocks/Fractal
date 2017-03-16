import { Component, ev } from '../../core'
import { StyleGroup } from '../../utils/style'

import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Button'

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    on: { click: ev(ctx, '$click') },
  }, [
    <any> s
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
    cursor: 'pointer',
    userSelect: 'none',
    $nest: {
      '&:hover': {
        backgroundColor: '#2853A4',
      },
    },
  },
}

let mDef: Component = {
  name,
  state: '',
  groups: {
    style,
  },
  inputs: ctx => ({
    $click: () => {},
  }),
  actions: {},
  interfaces: {
    view,
  },
}

export default mDef
