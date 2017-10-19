import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  clone,
} from '../../core'
import { View, h } from '../..//interfaces/view'

import * as List from './List'
import * as Note from './Note'

export const name = 'Root'

export const state = {
  _nest: {
    List: clone(List),
    Note: clone(Note),
  },
}

export type S = typeof state

export const inputs: Inputs = F => ({
  $List_select: async item => {
    await F.toChild('Note', '_action', 'setNote', item)
  },
})

export const actions: Actions<S> = {
}

const view: View<S> = F => s => {
  let style = F.ctx.groups.style

  return h('div', {
    key: F.ctx.name,
    class: { [style.base]: true },
  }, [
    F.vw('List'),
    F.vw('Note'),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
}

export const groups = { style }
