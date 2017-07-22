import {
  Actions,
  Inputs,
  Interfaces,
  assoc,
  StyleGroup,
  clickable,
} from '../../core'
import { View, h } from '../../interfaces/view'

const wait = ms => new Promise((resolve) => setTimeout(() => resolve(), ms))

export const name = 'Root'

export const state = {
  count: 0,
}

export type S = typeof state

export const inputs: Inputs<S> = ({ stateOf, toIt, toAct }) => ({
  runProcess: async () => {
    let s: S = stateOf()
    if (s.count > 0) {
      return actions.Set(0)
    }
    await wait(2000)
    await toAct('Inc')
    await wait(2000)
    await toAct('Set', 14)
    await toIt('second')
    await wait(2000)
    toAct('Inc')
  },
  second: async () => {
    await wait(2000)
    toAct('Set', 21)
    await wait(2000)
    toAct('Set', 31)
  },
})

export const actions: Actions<S> = {
  Inc: () => s => {
    s.count ++
    return s
  },
  Set: assoc('count'),
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
    on: { click: ev('runProcess') },
  }, s.count + '')
}

export const interfaces: Interfaces = { view }

const generalFont = {
  fontFamily: 'sans-serif',
  fontSize: '22px',
  color: '#292828',
}

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '20px',
    ...generalFont,
  },
  input: {
    padding: '5px',
    ...generalFont,
    $nest: {
      '&:focus': {
        outline: '2px solid #13A513',
      },
    },
  },
  menuBar: {
    padding: '5px',
    display: 'flex',
  },
  menuItem: {
    margin: '5px',
    padding: '3px 5px',
    fontSize: '16px',
    borderRadius: '4px',
    textDecoration: 'underline',
    color: '#565656',
    ...clickable,
    $nest: {
      '&:hover': {
        backgroundColor: '#eaeaea',
      },
    },
  },
  list: {
    width: '400px',
  },
}

export const groups = { style }
