import { Actions, Inputs, Interfaces, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'
import { palette } from './constants'

export const name = 'SideMenu'

export const state = 'Received'

export type S = string

export const inputs: Inputs<S> = ctx => ({
  selected: async () => {},
})

export const actions: Actions<S> = {}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('nav', {
    key: ctx.name,
    class: { [style.base]: true },
  },
    [
      'Received',
      'Important',
      'Sent',
    ].map(
      option => h('div', {
        class: {
          [style.option]: true,
          [style.optionSelected]: s === option,
        },
        on: {
          click: ev('selected', option),
        },
      }, option)
    )
  )
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    padding: '20px',
  },
  option: {
    padding: '10px',
    fontSize: '20px',
    ...clickable,
    $nest: {
      '&:hover': {
        backgroundColor: palette.hoveredBtn,
      },
    },
  },
  optionSelected: {
    borderLeft: '4px solid ' + palette.delimiter,
  },
}

export const groups = { style }
