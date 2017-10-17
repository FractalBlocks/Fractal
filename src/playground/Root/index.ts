import {
  Actions,
  Inputs,
  Interfaces,
  assoc,
  StyleGroup,
  clickable,
  AddComp,
  props,
  clone,
  _,
} from '../../core'
import { View, h } from '../../interfaces/view'

import * as Item from './Item'

export const state = {
  text: '',
  _nest: {},
}

export type S = typeof state

export const inputs: Inputs = ({ ctx, stateOf, toIt, toChild, nest, unnest, toAct, comps }) => ({
  inputKeyup: async ([keyCode, text]) => {
    if (keyCode === 13 && text !== '') {
      await toAct('SetText', '')
      await toAct('Add', id => 'hola ' + id + ': ' + text)
    } else {
      await toAct('SetText', text)
    }
  },
  setCheckAll: async (checked: boolean) => {
    comps('Item').broadcast('_action', ['SetChecked', checked])
  },
  removeChecked: async () => {
    let names = comps('Item').getNames()
    for (let i = 0, len = names.length; i < len; i++) {
      await toIt('$$Item_remove', [names[i]])
    }
  },
  $$Item_remove: async ([idx]) => {
    await toAct('_remove', idx)
  },
})

export const actions: Actions<S> = {
  SetText: assoc('text'),
  Add: AddComp((id, textFn) => [
    'Item_' + id,
    props({ text: textFn(id) })(clone(Item)),
  ]),
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
        keyup: ev('inputKeyup', _, [
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
      Object.keys(s._nest).map(
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
