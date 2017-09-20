import { Actions, Inputs, Interfaces, StyleGroup, _ } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Item'

export const state = {
  checked: false,
  text: '',
}

export type S = typeof state

export const inputs: Inputs<S> = ({ ctx }) => ({
  remove: async () => {},
})

export const actions: Actions<S> = {
  SetChecked: checked => s => {
    s.checked = checked
    return s
  },
}

const view: View<S> = ({ ctx, ev, act }) => s => {
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
        change: act('SetChecked', _, ['target', 'checked']),
      },
    }),
    <any> s.text,
    h('span', {
      class: { [style.remove]: true },
      on: {
        click: ev('remove'),
      },
    }, 'remove2'),
  ])
}

export const interfaces: Interfaces = { view }

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

export const groups = { style }
