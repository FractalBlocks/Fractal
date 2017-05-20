import { Actions, Inputs, ev, nest, unnest, clone, Interfaces, toIt } from '../../core'
import { action, vw, props, toChild, stateOf } from '../../component'
import { StyleGroup, clickable } from '../../style'
import { View, h } from '../../interfaces/view'

import * as Item from './Item'

export const name = 'Root'

export const state = {
  text: '',
  numItems: 0,
  items: {},
}

export type S = typeof state

export const inputs: Inputs<S> = ctx => ({
  action: action(actions),
  inputKeyup: ([idx, [keyCode, text]]) => {
    if (keyCode === 13 && text !== '') {
      nest(ctx, idx, props({ text })(clone(Item)))
      return [
        actions.SetText(''),
        actions.New(),
      ]
    } else {
      return actions.SetText(text)
    }
  },
  setCheckAll: (checked: boolean) => {
    let items = stateOf(ctx).items
    for (let i = 0, keys = Object.keys(items), len = keys.length; i < len; i++) {
      toChild(ctx, keys[i], 'action', ['SetChecked', checked])
    }
  },
  removeChecked: () => {
    let items = stateOf(ctx).items
    for (let i = 0, keys = Object.keys(items), len = keys.length; i < len; i++) {
      if (stateOf(ctx,  keys[i]).checked) {
        toIt(ctx, '$$Item_remove', [keys[i]])
      }
    }
  },
  $$Item_remove: ([idx]) => {
    unnest(ctx, idx)
    return actions.Remove(idx)
  },
})

export const actions: Actions<S> = {
  SetText: text => s => {
    s.text = text
    return s
  },
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

const view: View<S> = (ctx, s) => {
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
        keyup: ev(ctx, 'inputKeyup', s.numItems, [
          ['keyCode'],
          ['target', 'value'],
        ]),
      },
    }),
    h('div', {class: { [style.menuBar]: true }}, [
      h('div', {
        class: { [style.menuItem]: true },
        on: { click: ev(ctx, 'setCheckAll', true) },
      }, 'check all'),
      h('div', {
        class: { [style.menuItem]: true },
        on: { click: ev(ctx, 'setCheckAll', false) },
      }, 'uncheck all'),
      h('div', {
        class: { [style.menuItem]: true },
        on: { click: ev(ctx, 'removeChecked') },
      }, 'remove checked'),
    ]),
    h('ul', {class: { [style.list]: true }},
      Object.keys(s.items).map(
        idx => vw(ctx, idx),
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
        backgroundColor: '#c3c6c3',
      },
    },
  },
  list: {
    width: '400px',
  },
}

export const groups = { style }
