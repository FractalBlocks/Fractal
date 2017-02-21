import { Context, Component, stateOf, interfaceOf } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'
import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let state = ({key}) => ({
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
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: ViewInterface = (ctx, s) =>

h('div', {
  key: name,
  class: { [style.base]: true },
}, [
  h('div', {
    class: { [style.childCount]: true },
  }, [
    stateOf(ctx, 'counter').count,
  ]),
  interfaceOf(ctx, 'counter', 'view'),
])

let style: any = styleGroup({
  base: {
    width: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#DDE2E9',
  },
  childCount: {
    padding: '10px',
  },
}, name)


let mDef: Component = {
  name,
  state,
  components,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

