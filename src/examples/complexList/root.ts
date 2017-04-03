import { Component, Actions, Inputs, ev, merge, unmerge, clone } from '../../core'
import { action, vw, props } from '../../utils/component'
import { StyleGroup } from '../../utils/style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

import Item from './item'

const name = 'Root'

const state = {
  text: '',
  list: [],
}

const inputs: Inputs = ctx => ({
  action: action(actions),
  inputKeyup: ([idx, [keyCode, text]]) => {
    if (keyCode === 13 && text !== '') {
      merge(ctx, idx, props({ text })(clone(Item)))
      return [
        actions.SetText(''),
        actions.New(),
      ]
    } else {
      return actions.SetText(text)
    }
  },
  $$_remove: idx => {
    unmerge(ctx, idx)
    return actions.Remove(idx)
  },
})

const actions: Actions = {
  SetText: text => s => {
    s.text = text
    return s
  },
  New: () => s => {
    s.list.push(s.list.length)
    return s
  },
  Remove: idx => s => {
    delete s.list[idx]
    return s
  },
}

const view: View = (ctx, s) => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.input]: true },
      props: { value: s.text },
      on: {
        keyup: ev(ctx, 'inputKeyup', s.list.length, [
          ['keyCode'],
          ['target', 'value'],
        ]),
      },
    }),
    h('ul', {class: { [style.list]: true }},
      s.list.map(
        idx => vw(ctx, idx),
      )
    ),
  ])
}

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
  list: {
    width: '400px',
  },
}

const comp: Component = {
  name,
  groups: {
    style,
  },
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default comp
