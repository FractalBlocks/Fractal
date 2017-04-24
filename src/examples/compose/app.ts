import { Component, interfaceOf } from '../../core'
import { stateOf } from '../../component'
import { StyleGroup } from '../../style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

export const state = {}

export type S = typeof state

let view: View<S> = (ctx, s) => {
  let style = ctx.groups['style']
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

let mDef: Component<S> = {
  name,
  groups: {
    style,
  },
  state,
  components,
  inputs: ctx => ({}),
  actions: {},
  interfaces: {
    view,
  },
}

export default mDef

