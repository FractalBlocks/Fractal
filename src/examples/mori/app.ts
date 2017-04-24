import { Component, Inputs, Actions, ev } from '../../core'
import { StyleGroup, clickable } from '../../style'
import { hashMap } from 'mori'
import { evolve, get } from '../../mori'

import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let state = hashMap<string, string>(
  'count', 0,
)

let actions: Actions<any> = {
  Set: (count: number) => evolve('count', () => count),
  Inc: () => evolve('count', x => x + 1),
}

let inputs: Inputs<any> = ctx => ({
  set: n => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: View<any> = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: get(s, 'key'),
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev(ctx, 'inc'),
      },
    }, `${get(s, 'count')}`),
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
    backgroundColor: '#3232F2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...clickable,
  },
  reset: {
    padding: '4px',
    color: 'white',
    fontSize: '18px',
    backgroundColor: '#EA1818',
    ...clickable,
  },
}
let mDef: Component<any> = {
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

