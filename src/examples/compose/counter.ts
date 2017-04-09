import { Context, Component, ev } from '../../core'
import { StyleGroup, clickable } from '../../utils/style'

import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Counter'

let state = {
  count: 0,
}

let actions = {
  Set: (count: number) => state => {
    state.count = count
    return state
  },
  Inc: () => state => {
    state.count ++
    return state
  },
}

let inputs = (ctx: Context) => ({
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: View = (ctx, s) => {
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

let mDef: Component = {
  name,
  groups: {
    style,
  },
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef
