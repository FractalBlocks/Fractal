import { Component, interfaceOf } from '../../core'
// import { stateOf } from '../../utils/component'
import { StyleGroup } from '../../utils/style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

let components = {
  counter: require('./counter').default,
}

let state = ({key}) => ({
  key,
})

let view: View = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.childCount]: true },
    }, [
      // TODO: fix broken API, for traversing childs
      // stateOf(ctx, 'counter').count,
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

let mDef: Component = {
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

