import { Context, Component, ev } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'
import { hashMap, HashMap } from 'mori'
import { evolve, get } from '../../src/utils/mori'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let state = ({key}) => hashMap<string, string>(
  'key', key,
  'count', 0,
)

let actions = {
  Set: (count: number) => evolve('count', () => count),
  Inc: () => evolve('count', x => x + 1),
}

let inputs = (ctx: Context) => ({
  set: n => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: get(s, 'key'),
  class: { [style.base]: true },
}, [
  h('div', {
    class: { [style.count]: true },
    on: {
      click: ev(ctx, 'inc'),
    },
  }, `${get(s, 'count')}`),
])

let styleObj: StyleGroup = {
  base: {
    padding: '10px',
    backgroundColor: 'grey',
  },
  count: {
    width: '30px',
    height: '30px',
    margin: '10px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: 'blue',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

let style: any = styleGroup(styleObj, name)


let mDef: Component = {
  name,
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

