import { Inputs, Actions, Interfaces } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Counter'

export let state = 0

export type S = number

export const inputs: Inputs<S> = () => ({
  inc: async () => actions.Inc(),
  dec: async () => actions.Dec(),
})

export const actions: Actions<S> = {
  Inc: () => s => s + 1,
  Dec: () => s => s - 1,
}

const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { click: ev('inc') },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: { click: ev('dec') },
    }, '-'),
  ])

export const interfaces: Interfaces = { view }
