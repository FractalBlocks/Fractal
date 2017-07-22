import { Interfaces, Inputs, Actions, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Counter'

export const state = {
  count: 0,
}

export type S = typeof state

export const inputs: Inputs<S> = ctx => ({
  set: async (n: number) => actions.Set(n),
  inc: async () => actions.Inc(),
})

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

let view: View<S> = ({ ctx,  ev }) => s => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev('inc'),
      },
    }, `${s.count}`),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev('set', 0),
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
