import { Inputs, Actions, Interfaces, ev, _ } from '../../core'
import { StyleGroup } from '../../style'
import { toIt } from '../../component'

import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

export const name = 'Button'

export const state = ''

export type S = string

export const inputs: Inputs<S> = ctx => ({
  click: () => {},
  keypress: which => {
    if (which === 13) {
      toIt(ctx, 'click')
    }
  },
})

export const actions: Actions<S> = {}

const view: View<S> = (ctx, s) => {
  let style = ctx.groups['style']

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    attrs: { tabindex: 0 },
    on: {
      click: ev(ctx, 'click'),
      keypress: ev(ctx, 'keypress', _, 'which'),
    },
  }, [
    <any> s
  ])
}

export const interfaces: Interfaces = { view }

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

export const groups = { style }
