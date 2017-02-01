import { Context, Component } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'
import { hashMap, HashMap, get } from 'mori'
import { evolve } from '../../src/utils/mori'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let init = ({key}) => hashMap<string, any>(
  'key', key,
  'count', 0,
)

let actions = {
  Set: (count: number) => evolve('count', () => count),
  Inc: () => evolve('count', x => x + 1),
}

let inputs = {
  set: (ctx: Context) => (n: number) => ctx.do(actions.Set(n)),
  inc: (ctx: Context) => () => ctx.do(actions.Inc()),
}

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: get(s, 'key'),
  class: { [style.base]: true },
}, [
  h('div', {
    class: { [style.count]: true },
    on: {
      click: inputs.inc(ctx),
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


let mDef: Component<HashMap<string, any>> = {
  name,
  init,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

