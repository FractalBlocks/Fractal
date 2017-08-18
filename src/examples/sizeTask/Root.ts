import {
  Actions,
  Interfaces,
  StyleGroup,
  assoc,
  absoluteCenter,
  Inputs,
  Task,
  _,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Root'

export const state = {
  active: false,
  width: 0,
}

export type S = typeof state

export const inputs: Inputs<S> = ({ ctx, ev, toAct, toIt }) => ({
  toggle: async () => <Task> [
    'size',
    ['.' + ctx.groups.style.base, 'width', ev('setWidthToggle', _, '*')],
  ],
  setWidthToggle: async width => {
    await toAct('SetWidth', width)
    await toAct('Toggle')
  },
})

export const actions: Actions<S> = {
  Toggle: () => s => {
    s.active = !s.active
    return s
  },
  SetWidth: assoc('width'),
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: {
        [style.bar]: true,
      },
      style: s.active ? { transform: `translateY(-30px) scaleX(${s.width * 0.8 / 100})` } : {},
      on: {
        click: ev('toggle'),
      },
    }, ''),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    ...absoluteCenter,
  },
  bar: {
    width: '100px',
    height: '100px',
    backgroundColor: '#1A69EE',
    transition: 'transform 0.4s',
  },
}

export const groups = { style }
