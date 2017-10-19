import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
} from '../../core'
import { View, h } from '../../interfaces/view'

export const state = {
  title: '',
  body: '',
}

export type S = typeof state

export const inputs: Inputs = () => ({
})

export const actions: Actions<S> = {
  SetNote: ({ title, body }) => s => {
    s.title = title
    s.body = body
    return s
  },
}

const view: View<S> = ({ ctx }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('div', {class: { [style.title]: true }}, s.title),
    h('div', {class: { [style.body]: true }}, s.body),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
}

export const groups = { style }
