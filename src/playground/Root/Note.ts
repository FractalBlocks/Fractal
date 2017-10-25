import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  _,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const state = {
  id: '',
  title: '',
  body: '',
  _timestamp: 0,
}

export type S = typeof state

export const inputs: Inputs = F => ({
  set: async ([name, value]) => {
    let s: S = F.stateOf()
    await F.runIt(['db', ['setItemProps', s.id, { [name]: value }]])
  },
  setNoteFromId: async id => {
    let s: S = F.stateOf()
    if (s.id !== '') {
      await F.runIt(['db', ['unsubscribe', F.ctx.id, s.id]])
    }
    let note = await F.runIt(['db', ['subscribe', F.ctx.id, id, F.act('SetNote', _, '*')]])
    await F.toAct('SetNote', ['set', id, note])
  },
})

export const actions: Actions<S> = {
  SetNote: ([evName, id, item]) => s => ({
    ...s,
    id,
    ...evName === 'add' || evName === 'set'
      ? item
      : evName === 'remove'
      ? { id: '' }
      : {}
  })
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, s.id == '' ? [
    h('div', {
      class: { [style.title]: true },
    }, 'No one selected ...'),
  ] : [
    h('input', {
      class: { [style.title]: true },
      props: { value: s.title },
      on: { change: ev('set', 'title', ['target', 'value']) },
    }),
    h('textarea', {
      class: { [style.body]: true },
      props: { value: s.body },
      on: { change: ev('set', 'body', ['target', 'value']) },
    }),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  title: {
    width: '100%',
    fontSize: '34px',
    paddingBottom: '20px',
    border: 'none',
    outline: 'none',
  },
  body: {
    width: '100%',
    height: 'calc(100% - 63px)',
    fontSize: '21px',
    color: '#484747',
    border: 'none',
    outline: 'none',
  },
}

export const groups = { style }
