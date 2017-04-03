import { Component, Actions, Inputs, ev } from '../../core'
import { StyleGroup } from '../../utils/style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

const name = 'Root'

const state = {
  text: '',
}

const inputs: Inputs = ctx => ({
    $$remove: () => {},
})

const actions: Actions = {
}

const view: View = (ctx, s) => {
  let style = ctx.groups.style

  return h('li', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    <any> s.text,
    h('span', {
      class: { [style.remove]: true },
      on: {
        click: ev(ctx, '$$remove'),
      },
    }, 'remove'),
  ])
}

const style: StyleGroup = {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 10px 10px 20px',
    borderBottom: '1px solid #C1B8B8',
  },
  remove: {
    fontSize: '20px',
    padding: '3px',
    borderRadius: '4px',
    color: 'white',
    backgroundColor: '#DB4343',
    cursor: 'pointer',
    userSelect: 'none',
    $nest: {
      '&:hover': {
        backgroundColor: '#DE3030',
      },
    },
  },
}

const comp: Component = {
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

export default comp
