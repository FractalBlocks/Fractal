import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  getStyle,
} from '../core'
import { View, h } from '../interfaces/view'

export const state = {}

export type S = typeof state

export const inputs: Inputs = F => ({
})

export const actions: Actions<S> = {
}

const view: View<S> = F => async s => {
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
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
}

export const groups = { style }
