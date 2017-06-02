import { Interfaces } from '../../core'
import { StyleGroup } from '../../style'
import { View, h } from '../../interfaces/view'

import * as Counter from './Counter'

export const name = 'Main'

export const components = {
  Counter,
}

export const state = {}

export type S = typeof state

let view: View<S> = ({ ctx, stateOf, vw }) => s => {
  let style = ctx.groups.style
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.childCount]: true },
    }, [
      stateOf('Counter').count,
    ]),
    vw('Counter'),
  ])
}

export const interfaces: Interfaces = { view }

let style: StyleGroup = {
  base: {
    width: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#DDE2E9',
  },
  childCount: {
    padding: '10px',
  },
}

export const groups = { style }
