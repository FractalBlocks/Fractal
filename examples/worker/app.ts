import { Component, stateOf, interfaceOf } from '../../src'
import { StyleGroup } from '../../utils/style'
import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups.style
  return h('div', {
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
}

let style: StyleGroup = {
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
  groups: {
    style,
  },
  state: {},
  components,
  inputs: ctx => ({}),
  actions: {},
  interfaces: {
    view,
  },
}

export default main

