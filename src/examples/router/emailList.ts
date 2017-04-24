import {  Actions, Inputs, ev } from '../../core'
import { StyleGroup, clickable } from '../../style'
import { View } from '../../interfaces/view'
import { action, toParent } from '../../component'
import h from 'snabbdom/h'
import { palette } from './constants'

export const name = 'EmailList'

export const state = {
  emails: {},
}

export type S = typeof state

export const inputs: Inputs<S> = ctx => ({
  action: action(actions),
  selectEmail: id => {
    toParent(ctx, 'select', id)
  },
})

export const actions: Actions<S> = {
  SetEmails: emails => s => {
    s.emails = emails
    return s
  },
}

const view: View<S> = (ctx, s) => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  },
    Object.keys(s.emails).map(
      id => h('div', {
        class: { [style.item]: true },
        on: {
          click: ev(ctx, 'selectEmail', id),
        },
      }, s.emails[id].sender + ' - ' + s.emails[id].title + ' - Date: ' + s.emails[id].date)
    ),
  )
}

export const interfaces = { view }

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
