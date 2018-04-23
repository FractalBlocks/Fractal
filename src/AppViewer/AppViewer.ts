import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  getStyle,
  State,
} from '../core'
import { View, h } from '../interfaces/view'

export const state: State = {}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
})

export const actions: Actions<S> = {
}

const view: View<S> = async (s, F) => {
  let style = getStyle(F)

  return h('div', {
    key: F.ctx.name,
    class: style('base'),
  }, [
    <any> 'App Viewer',
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '200px',
    height: '100%',
    overflow: 'auto',
    border: '2px solid grey',
  },
}

export const groups = { style }
