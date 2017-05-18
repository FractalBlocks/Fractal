import { interfaceOf, Interfaces } from '../../core'
import { stateOf } from '../../component'
import { StyleGroup } from '../../style'
import { View } from '../../interfaces/view'
import h from '../../interfaces/h'

import * as Counter from './counter'

export const name = 'Main'

export const components = {
  Counter,
}

export const state = {}

export type S = typeof state

let view: View<S> = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.childCount]: true },
    }, [
      stateOf(ctx, 'Counter').count,
    ]),
    interfaceOf(ctx, 'Counter', 'view'),
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
