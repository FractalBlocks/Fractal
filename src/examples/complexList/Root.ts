import {
  Actions,
  Inputs,
  clone,
  Interfaces,
  assoc,
  props,
  StyleGroup,
  clickable,
} from '../../core'
import { View, h } from '../../interfaces/view'

import * as Item from './Item'

export const name = 'Root'

export const state = {
  text: '',
  numItems: 0,
  items: {},
}

// export const defs = { Item }

export type S = typeof state

export const inputs: Inputs<S> = ({ ctx, stateOf, toIt, toChild, nest, unnest }) => ({
  inputKeyup: async ([idx, [keyCode, text]]) => {
    if (keyCode === 13 && text !== '') {
      ctx.components[ctx.id].def.defs = { Item }
      await nest(idx, props({ text })(clone(Item)))
      return [
        actions.SetText(''),
        actions.New(),
      ]
    } else {
      return actions.SetText(text)
    }
  },
  setCheckAll: async (checked: boolean) => {
    let items = stateOf().items
    let key
    for (key in items) {
      await toChild(key, 'action', ['SetChecked', checked])
    }
  },
  removeChecked: async () => {
    let items = stateOf().items
    let key
    for (key in items) {
      if (stateOf(key).checked) {
        await toIt('$$Item_remove', [key])
      }
    }
  },
  $$Item_remove: async ([idx]) => {
    unnest(idx)
    return actions.Remove(idx)
  },
})

export const actions: Actions<S> = {
  SetText: assoc('text'),
  New: () => s => {
    s.items[s.numItems] = s.numItems
    s.numItems++
    return s
  },
  Remove: idx => s => {
    delete s.items[idx]
    return s
  },
}

const view: View<S> = ({ ctx, ev, vw }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.input]: true },
      attrs: { placeholder: 'Type and hit enter' },
      props: { value: s.text },
      on: {
        keyup: ev('inputKeyup', s.numItems, [
          ['keyCode'],
          ['target', 'value'],
        ]),
      },
    }),
    h('div', {class: { [style.menuBar]: true }}, [
      h('div', {
        class: { [style.menuItem]: true },
        on: { click: ev('setCheckAll', true) },
      }, 'check all'),
      h('div', {
        class: { [style.menuItem]: true },
        on: { click: ev('setCheckAll', false) },
      }, 'uncheck all'),
      h('div#el', {
        class: { [style.menuItem]: true },
        on: { click: ev('removeChecked') },
      }, 'remove checked'),
    ]),
    h('ul', {class: { [style.list]: true }},
      Object.keys(s.items).map(
        idx => vw(idx),
      )
    ),
  ])
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
