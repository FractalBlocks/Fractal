import { Context, Component, stateOf, interfaceOf, execute } from '../../src'
import { styleGroup, StyleGroup, getStyles } from '../../src/utils/style'
import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let init = ctx => {
  execute(ctx, ctx.id, ['style', getStyles()])
}

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

let style: any = {
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
}

let main: Component = {
  name,
  init,
  state: ({key}) => ({}),
  components,
  inputs: ctx => ({}),
  actions: {},
  interfaces: {
    view,
  },
}

export default main

