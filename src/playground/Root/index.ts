import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  clone,
  styles,
  deepmerge,
  Interface,
} from '../../core'
import { View, h } from '../..//interfaces/view'

import * as List from './List'
import * as Note from './Note'

export const state = {
  activeChild: '',
  _nest: <any> {
    List: clone(List),
    Note: styles({ base: { width: 'calc(100% - 400px)' }})(clone(Note)),
  },
}

export type S = typeof state

export const inputs: Inputs = F => ({
  init: async () => {
    // Merge precalculated state (SSR)
    if (typeof window !== 'undefined' && (window as any).ssrInitialized) {
      let components = (window as any).ssrComponents
      let name
      for (name in components) {
        F.ctx.components[name].state = deepmerge(F.ctx.components[name].state, components[name].state)
      }
    }
  },
  Route_active: async ([id]) => {
    if (id !== '') {
      await F.toIt('$List_select', id)
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

const route: Interface<any, S> = F => async s => [
  [F.ctx.id, s.activeChild],
  ...s.activeChild !== '' ? await F.interfaceOf('Note', 'route') : [],
]

const view: View<S> = F => async s => {
  let style = F.ctx.groups.style

  return h('div', {
    key: F.ctx.name,
    class: { [style.base]: true },
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
