import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  clone,
  styles,
  Interface,
  getStyle,
  State,
  hydrateState,
  isBrowser,
} from '../../core'
import { View, h } from '../../interfaces/view'

import * as List from './List'
import * as Note from './Note'

export const state: State = {
  activeChild: '',
  _nest: {
    List: clone(List),
    Note: styles({ base: { width: 'calc(100% - 400px)' }})(clone(Note)),
  },
}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
  onInit: async () => {
    if (isBrowser) {
      hydrateState(F.ctx)
    }
  },
  onRouteActive: async ([id]) => {
    if (id === '') return
    const item = await F.task('db', ['getItem', id])
    if (item) {
      await F.toIn('$List_select', id)
    } else {
      await F.toAct('Set', ['activeChild', ''])
    }
  },
  $List_select: async id => {
    await F.toAct('Set', ['activeChild', id])
    await F.toChild('Note', 'setNoteFromId', id)
  },
  $Note_removed: async id => {
    await F.toAct('Set', ['activeChild', ''])
  },
})

export const actions: Actions<S> = {
}

const route: Interface<any, S> = async (s, F) => [
  [F.ctx.id, s.activeChild],
]

const view: View<S> = async (s, F) => {
  let style = getStyle(F)

  return h('div', {
    key: F.ctx.name,
    class: style('base'),
  }, [
    await F.vw('List'),
    await F.vw('Note'),
  ])
}

export const interfaces: Interfaces = { route, view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'auto',
    fontFamily: 'Sans serif',
    color: '#292828',
  },
}

export const groups = { style }
