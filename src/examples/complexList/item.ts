import { Component, Actions, Inputs, ev, _ } from '../../core'
import { toParent, action, act } from '../../component'
import { StyleGroup } from '../../style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

const name = 'Item'

export const state = {
  checked: false,
  text: '',
}

export type S = typeof state

const inputs: Inputs<S> = ctx => ({
  action: action(actions),
  $$remove: () => {
    toParent(ctx, 'remove', _, true)
  },
})

const actions: Actions<S> = {
  SetChecked: checked => s => {
    s.checked = checked
    return s
  },
}

const view: View<S> = (ctx, s) => {
  let style = ctx.groups.style

  return h('li', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.checkbox]: true },
      props: {
        type: 'checkbox',
        checked: s.checked,
      },
      on: {
        change: act(ctx, 'SetChecked', ['target', 'checked']),
      },
    }),
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
  checkbox: {},
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

const comp: Component<S> = {
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
