import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  _,
  getStyle,
  waitMS,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const state = {
  activeChild: '',
  id: '',
  title: '',
  body: '',
  count: 0,
  _timestamp: 0,
}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
  init: async () => {
    if (typeof window !== 'undefined') {
      F.toIn('self')
    }
  },
  self: async () => {
    await waitMS(1000)
    await F.toAct('Inc')
    F.toIn('self')
  },
  set: async ([name, value]) => {
    await F.task('db', ['setItemProps', s.id, { [name]: value }])
  },
  setNoteFromId: async id => {
    if (s.id !== '') {
      await F.task('db', ['unsubscribe', s.id])
    }
    let note = await F.task('db', ['subscribe', id, F.in('setNote', _, '*')])
    await F.toAct('SetNote', ['set', id, note])
    await F.set('id', id)
  },
  setNote: async ([evName, id, item]) => {
    await F.toAct('SetNote', [evName, id, item])
    if (evName === 'remove') {
      await F.toIn('removed')
    }
  },
  removed: async () => {},
})

export const actions: Actions<S> = {
  Inc: async () => async s => {
    s.count++
  },
  SetNote: ([evName, id, item]) => s => {
    s.id = evName === 'remove' ? '' : id
    if (evName === 'add' || evName === 'set') {
      s.title = item.title
      s.body = item.body
    }
  },
}

const view: View<S> = async (s, F) => {
  let style = getStyle(F)

  return h('div', {
    key: F.ctx.name,
    class: style('base'),
  }, s.id == '' ? [
    h('div', {
      class: style('title'),
    }, 'No one selected ... time: ' + s.count),
  ] : [
    h('input', {
      class: style('title'),
      props: { value: s.title },
      on: { change: F.in('set', 'title', ['target', 'value']) },
    }),
    h('textarea', {
      class: style('body'),
      props: { value: s.body },
      on: { change: F.in('set', 'body', ['target', 'value']) },
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
