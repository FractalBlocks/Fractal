import { Context, Component, stateOf, interfaceOf, Hooks } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'

import { ViewInterface } from '../../src/interfaces/view'
import {  } from 'snabbdom'
import h from 'snabbdom/h'
Node
let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let state = ({key}) => ({
  key,
  count: 0,
})

let hooks: Hooks = {
  init: (mod, ctx) => {
    mod.merge('counter', components.counter)
  },
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

let events = (ctx: Context) => ({
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
    padding: '10px',
    backgroundColor: '#DDE2E9',
  },
  childCount: {
    padding: '10px',
  },
}, name)


let mDef: Component = {
  name,
  state,
  hooks,
  events,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

