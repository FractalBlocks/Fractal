import { Actions, Inputs, Interfaces, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'
import { palette } from './constants'

export const name = 'Email'

// TODO: make an Email interface
export const state = {
  sender: '',
  title: '',
  content: '',
  date: '',
}

export type S = typeof state

export const inputs: Inputs<S> = ({ ctx }) => ({
  back: async () => {},
})

export const actions: Actions<S> = {
  Set: email => () => email,
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('div', {class: { [style.header]: true }}, [
      h('div', {
        class: { [style.back]: true },
        on: {
          click: ev('back'),
        },
      }, 'back'),
      h('div', {class: { [style.title]: true }}, s.title),
    ]),
    h('div', {class: { [style.content]: true }}, s.content),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    padding: '20px',
  },
  header: {
    width: '90%',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid ' + palette.delimiter,
  },
  back: {
    padding: '8px',
    fontSize: '18px',
    ...clickable,
    $nest: {
      '&:hover': {
        backgroundColor: palette.hoveredBtn,
      },
    },
  },
  title: {
    paddingLeft: '20px',
    fontSize: '26px',
  },
  content: {
    padding: '28px',
    fontSize: '20px',
  },
}

export const groups = { style }
