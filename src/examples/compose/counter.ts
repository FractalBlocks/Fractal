import { Inputs, Actions, Interfaces, ev } from '../../core'
import { StyleGroup, clickable } from '../../style'

import { View } from '../../interfaces/view'
import h from '../../interfaces/h'

export const name = 'Counter'

export const state = {
  count: 0,
}

export type S = typeof state

export const actions: Actions<S> = {
  Set: (count: number) => state => {
    state.count = count
    return state
  },
  Inc: () => state => {
    state.count ++
    return state
  },
}

export const inputs: Inputs<S> = ctx => ({
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: View<S> = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev(ctx, 'inc'),
      },
    }, `${s.count}`),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev(ctx, 'set', 0),
      },
    }, 'reset'),
  ])
}

export const interfaces: Interfaces = { view }

let style: StyleGroup = {
  base: {
    width: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#C1C6CC',
  },
  count: {
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    backgroundColor: '#4343EC',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...clickable,
  },
  reset: {
    padding: '4px',
    color: 'white',
    fontSize: '18px',
    backgroundColor: '#E53B3B',
    ...clickable,
  },
}

export const groups = { style }
