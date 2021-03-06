import {
  Actions,
  Inputs,
  Interfaces,
  StyleGroup,
  clickable,
  _,
  getStyle,
  props,
} from '../../../core'
import { View, h } from '../../../interfaces/view'
import { assoc } from '../../../utils/fun'

import * as Item from './Item'

export const state = {
  text: '',
  _nest: {},
  _compUpdated: false,
}

export type S = typeof state

export const inputs: Inputs<S> = (s, F) => ({
  onInit: async () => {
    let items = await F.task('db', ['subscribe', '*', F.in('updateItem', _, '*')])
    await F.toAct('SetItems', items)
  },
  inputKeyup: async ([keyCode, text]) => {
    if (keyCode === 13 && text !== '') {
      await F.toAct('SetText', '')
      await F.toIn('add', text)
    } else {
      await F.toAct('SetText', text)
    }
  },
  add: async text => {
    await F.task('db', ['addItem', { title: text, body: '', _timestamp: Date.now() }])
  },
  updateItem: async ([name, id, item]) => {
    if (name === 'add') {
      await F.toAct('AddItem', [id, item])
    } else if (name === 'set') {
      await F.toChild('Item_' + id, '_action', ['SetItem', item])
    } else if (name === 'remove') {
      await F.toAct('_remove', 'Item_' + id)
    }
  },
  setCheckAll: async (checked: boolean) => {
    await F.comps('Item').broadcast('_action', ['SetChecked', checked])
  },
  removeChecked: async () => {
    let names = F.comps('Item').getNames()
    for (let i = 0, len = names.length; i < len; i++) {
      if (F.stateOf('Item_' + names[i]).checked) {
        setImmediate(() => F.toIn('$Item_remove', [names[i]]))
      }
    }
  },
  $Item_remove: async ([name]) => {
    await F.task('db', ['remove', name])
  },
  $Item_select: async ([id]) => {
    await F.toIn('select', id)
  },
  select: async id => {},
})

export const actions: Actions<S> = {
  SetText: assoc('text'),
  AddItem: ([id, data]) => s => {
    s._nest['Item_' + id] = props(data)(Item)
    s._compUpdated = true
    return s
  },
  SetItems: items => s => {
    Object.keys(items).map(
      id => (<any> actions.AddItem([id, items[id]]))(s)
    )
    return s
  },
}

const view: View<S> = async (s, F) => {
  let style = getStyle(F)

  return h('div', {
    key: F.ctx.name,
    class: style('base'),
  }, [
    h('input', {
      class: style('input'),
      attrs: { placeholder: 'Type and hit enter' },
      props: { value: s.text },
      on: {
        keyup: F.in('inputKeyup', _, [
          ['keyCode'],
          ['target', 'value'],
        ]),
      },
    }),
    h('div', { class: style('menuBar') }, [
      h('div', {
        class: style('menuItem'),
        on: { click: F.in('setCheckAll', true) },
      }, 'check all'),
      h('div', {
        class: style('menuItem'),
        on: { click: F.in('setCheckAll', false) },
      }, 'uncheck all'),
      h('div#el', {
        class: style('menuItem'),
        on: { click: F.in('removeChecked') },
      }, 'remove checked'),
    ]),
    h('ul', { class: style('list') },
      await F.group('Item'),
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
    width: '400px',
    overflow: 'auto',
    padding: '20px',
    ...generalFont,
  },
  input: {
    width: '100%',
    padding: '5px',
    ...generalFont,
    $nest: {
      '&:focus': {
        outline: '2px solid #13A513',
      },
    },
  },
  menuBar: {
    padding: '3px',
    display: 'flex',
    justifyContent: 'center',
  },
  menuItem: {
    margin: '5px',
    padding: '3px 5px',
    fontSize: '16px',
    borderRadius: '4px',
    color: '#565656',
    border: '1px solid #e2dfdf',
    ...clickable,
    $nest: {
      '&:hover': {
        backgroundColor: '#eaeaea',
      },
    },
  },
  list: {
    width: '100%',
    margin: '0',
    padding: '0',
  },
}

export const groups = { style }
