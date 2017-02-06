import { Context, Component } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let init = ({key}) => ({
  key,
  count: 0,
})

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
  set: (n: number) => ctx.do(actions.Set(n)),
  inc: () => ctx.do(actions.Inc()),
})

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: name,
  class: { [style.base]: true },
}, [
  ctx.state('counter'),
  ctx.interface('counter', 'view'),
])

let style: any = styleGroup({
  base: {
    width: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#DDE2E9',
  },
}, name)


let mDef: Component = {
  name,
  init,
  inputs,
  actions,
  components,
  interfaces: {
    view,
  },
}

export default mDef

