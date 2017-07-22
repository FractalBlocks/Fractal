import { Inputs, Actions, Interfaces, StyleGroup, _ } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Button'

export const state = ''

export type S = string

export const inputs: Inputs<S> = ({ ctx, toIt }) => ({
  click: async () => {},
  keypress: async which => {
    if (which === 13) {
      await toIt('click')
    }
  },
})

export const actions: Actions<S> = {}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups['style']

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    attrs: { tabindex: 0 },
    on: {
      click: ev('click'),
      keypress: ev('keypress', _, 'which'),
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
