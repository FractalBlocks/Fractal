import { Component, ev, dispatch } from '../../core'
import { StyleGroup } from '../../utils/style'

import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Button'

let view: View = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    attrs: { tabindex: 0 },
    on: {
      click: ev(ctx, '$click'),
      keypress: ev(ctx, 'keypress', undefined, ['which']),
    },
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
    keypress: which => {
      if (which === 13) {
        dispatch(ctx, [ctx.id, '$click'])
      }
    },
  }),
  actions: {},
  interfaces: {
    view,
  },
}

export default mDef
