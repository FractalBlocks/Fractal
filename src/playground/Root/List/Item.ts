import { Actions, Inputs, Interfaces, StyleGroup, _, absoluteCenter, getStyle } from '../../../core'
import { View, h } from '../../../interfaces/view'

export const state = {
  checked: false,
  title: '',
}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
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

const view: View<S> = async (s, F) => {
  let style = getStyle(F)

  return h('li', {
    key: F.ctx.name,
    class: style('base'),
  }, [
    h('input', {
      class: style('checkbox'),
      props: {
        type: 'checkbox',
        checked: s.checked,
      },
      on: {
        change: F.act('SetChecked', _, ['target', 'checked']),
      },
    }),
    h('div', {
      class: style('title'),
      on: { click: F.in('select') },
    }, s.title),
    h('div', {
      class: style('remove'),
      on: {
        click: F.in('remove'),
      },
    }, [
      h('div', {class: style('removeLine')}),
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
