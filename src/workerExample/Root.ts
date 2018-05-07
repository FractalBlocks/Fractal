import { Inputs, Interfaces, StyleGroup, Actions, getStyle } from '../core'
import { View, h } from '../interfaces/view'

export const state = {
  count: 0,
}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
  inc: async () => {
    if (s.count === 0) {
      console.time('time')
    }
    await F.toAct('Inc')
    if (s.count < 200) {
      setImmediate(() => {
        F.toIn('inc')
      })
    } else {
      console.timeEnd('time')
    }
  },
})

export const actions: Actions<S> = {
  Inc: () => s => {
    let a = 100
    for (let i = 0; i < 5000; i++) {
      for (let j = 0; j < 1000; j++) {
        a++
        a = a * 10 -1
        a = Math.round((a - 1) / 10)
      }
    }
    a = s.count
    s.count = a
    s.count++
  },
}

const view: View<S> = async (s, F) => {
  const style = getStyle(F)
  return h('div', { class: style('base') }, [
    h('div', {
      class: style('count'),
      on: { click: F.in('inc') },
    }, 'Count ' + s.count),
    // Just for testing expirience
    h('button', 'hello'),
    h('select', [
      h('option', '1. One'),
      h('option', '2. Two'),
      h('option', '3. Three'),
      h('option', '4. Four'),
    ]),
    h('div', { class: style('hoverable') }, 'hover me 1'),
    h('div', { class: style('hoverable') }, 'hover me 2'),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
  },
  count: {
    color: 'green',
    fontSize: '40px',
  },
  hoverable: {
    margin: '100px',
    width: '100%',
    height: '100vh',
    backgroundColor: '#17619b',
    transition: 'background-color 0.4s',
    $nest: {
      '&:hover': {
        backgroundColor: '#3882bd',
      },
    },
  },
}

export const groups = { style }
