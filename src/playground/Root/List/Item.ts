import { Actions, Inputs, Interfaces, StyleGroup, _, absoluteCenter } from '../../../core'
import { View, h } from '../../../interfaces/view'

export const state = {
  checked: false,
  title: '',
}

export type S = typeof state

export const inputs: Inputs = F => ({
  remove: async () => {},
  select: async id => {},
})

export const actions: Actions<S> = {
  SetChecked: checked => s => {
    s.checked = checked
    return s
  },
  SetItem: item => s => ({
    ...s,
    ...item,
  })
}

const view: View<S> = ({ ctx, ev, act }) => async s => {
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
    h('div', {
      class: { [style.title]: true },
      on: { click: ev('select') },
    }, s.title),
    h('div', {
      class: { [style.remove]: true },
      on: {
        click: ev('remove'),
      },
    }, [
      h('div', {class: { [style.removeLine]: true }}),
    ]),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #C1B8B8',
  },
  checkbox: {},
  title: {
    padding: '10px 5px',
    cursor: 'pointer',
  },
  remove: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#DB4343',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '1px 1px 0px 0px #3f3f3f',
    ...absoluteCenter,
    $nest: {
      '&:hover': {
        backgroundColor: '#DE3030',
      },
    },
  },
  removeLine: {
    width: 'calc(100% - 8px)',
    height: '3px',
    borderRadius: '1px',
    backgroundColor: 'white',
  },
}

export const groups = { style }
