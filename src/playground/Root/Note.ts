import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const state = {
  idx: -1,
  title: '',
  body: '',
}

export type S = typeof state

export const inputs: Inputs = F => ({
  set: async ([name, value]) => {
    await F.toAct('Set', [name, value])
    await F.runIt(['db', ['setItem', [name, value]]])
  },
})

export const actions: Actions<S> = {
  SetNote: ({ title, body }) => s => {
    s.title = title
    s.body = body
    return s
  },
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.title]: true },
      on: { change: ev('set', 'title', ['target', 'value']) },
    }),
    h('textarea', {
      class: { [style.body]: true },
      on: { change: ev('set', 'body', ['target', 'value']) },
    }),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  title: {
    width: '100%',
    padding: '10px',
    fontSize: '34px',
    border: 'none',
  },
  body: {
    width: '100%',
    height: 'calc(100% - 63px)',
    border: 'none',
  },
}

export const groups = { style }
