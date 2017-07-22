import { Actions, Inputs, Interfaces, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'
import { palette } from './constants'

export const name = 'EmailList'

export const state = {
  emails: {},
}

export type S = typeof state

export const inputs: Inputs<S> = ({ ctx }) => ({
  select: async id => {},
})

export const actions: Actions<S> = {
  SetEmails: emails => s => {
    s.emails = emails
    return s
  },
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  },
    Object.keys(s.emails).map(
      id => h('div', {
        class: { [style.item]: true },
        on: {
          click: ev('select', id),
        },
      }, `${s.emails[id].sender} - ${s.emails[id].title} - Date: ${s.emails[id].date}`)
    ),
  )
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    padding: '20px',
  },
  item: {
    padding: '10px',
    fontSize: '18px',
    borderBottom: '1px solid ' + palette.delimiter,
    ...clickable,
    $nest: {
      '&:hover': {
        backgroundColor: palette.hoveredBtn,
      },
    },
  },
}

export const groups = { style }
