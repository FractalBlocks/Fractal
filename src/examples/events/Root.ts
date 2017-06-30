import { Interfaces, StyleGroup, absoluteCenter, Actions, _ } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Main'

export const state = {
  global: false,
  setStates: [false, false, false],
  states: [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
  ]
}

export type S = typeof state

export const actions: Actions<S> = {
  ToggleContainer: () => s => {
    s.global = !s.global
    return s
  },
  ToggleSet: idx => s => {
    s.setStates[idx] = !s.setStates[idx]
    return s
  },
  ToggleSquare: ([idx, jdx]) => s => {
    s.states[idx][jdx] = !s.states[idx][jdx]
    return s
  },
}

let view: View<S> = ({ ctx, stateOf, vw, act }) => s => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: {
      [style.base]: true,
    },
  }, [
    h('div', {
      class: {
        [style.container]: true,
        [style.containerActive]: s.global,
        [style.box]: true,
      },
      on: {
        click: act('ToggleContainer', undefined),
      },
    }, s.states.map(
      (set, idx) => h('div', {
        class: {
          [style.set]: true,
          [style.setActive]: s.setStates[idx],
          [style.box]: true,
        },
        on: {
          click: act('ToggleSet', idx, _, { listenPrevented: idx === 0 || idx === 3 }),
        },
        global: {
          click: act('ToggleSet', idx, _, { selfPropagated: idx === 2 || idx === 3 }),
        },
      }, set.map(
        (square, jdx) => h('div', {
          class: {
            [style.square]: true,
            [style.squareActive]: square,
            [style.box]: true,
          },
          on: {
            click: act('ToggleSquare', [idx, jdx], _, { default: jdx === 0 || jdx === 3 }),
          },
        }, 'default: ' + (jdx === 0 || jdx === 3 ? 'true' : 'false'))
      ).concat(
        h('div', {
          class: { [style.title]: true },
        }, 'listenPrevented: ' + (idx === 0 || idx === 3 ? 'true' : 'false'))
      ).concat(
        h('div', {
          class: { [style.title]: true },
        }, 'selfPropagated: ' + (idx === 2 || idx === 3 ? 'true' : 'false'))
      )
    )))
  ])
}

export const interfaces: Interfaces = { view }

let style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    ...absoluteCenter,
  },
  box: {
    border: '4px solid #666366',
    borderRadius: '8px',
    backgroundColor: '#F7F7F8',
    color: '#403F3F',
    ...absoluteCenter,
    $nest: {
      '&:hover': {
        borderStyle: 'dashed',
      },
    },
  },
  container: {
    width: '670px',
    height: '670px',
    ...absoluteCenter,
    flexWrap: 'wrap',
    alignContent: 'center',
  },
  containerActive: {
    backgroundColor: '#7B1FA2',
  },
  set: {
    margin: '10px',
    padding: '20px',
    width: '300px',
    height: '300px',
    ...absoluteCenter,
    flexWrap: 'wrap',
    alignContent: 'center',
  },
  setActive: {
    backgroundColor: '#37CB34',
  },
  square: {
    margin: '10px',
    width: '100px',
    height: '100px',
  },
  squareActive: {
    backgroundColor: '#B8DAB7',
  },
}

export const groups = { style }
