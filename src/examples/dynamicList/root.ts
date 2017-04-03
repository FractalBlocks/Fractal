import { Component, Actions, Inputs, ev, _ } from '../../core'
import { action, act } from '../../utils/component'
import { StyleGroup } from '../../utils/style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

const name = 'Root'

const state = {
  text: '',
  list: [],
}

const inputs: Inputs = ctx => ({
  action: action(actions),
  inputKeyup: ([keyCode, text]) =>
    keyCode === 13 && text !== ''
    ? [
      actions.SetText(''),
      actions.New(text),
    ] : actions.SetText(text),
})

const actions: Actions = {
  SetText: text => s => {
    s.text = text
    return s
  },
  New: text => s => {
    s.list.push(text)
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
        keyup: ev(ctx, 'inputKeyup', _, [
          ['keyCode'],
          ['target', 'value'],
        ]),
      },
    }),
    h('ul', {class: { [style.list]: true }},
      s.list.map(
        (item, idx) => h('li', {
          key: idx,
          class: { [style.item]: true },
        }, [
          <any> item,
          h('span', {
            class: { [style.remove]: true },
            on: {
              click: act(ctx, ['Remove', idx]),
            },
          }, 'remove'),
        ]),
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
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 10px 10px 20px',
    borderBottom: '1px solid #C1B8B8',
  },
  remove: {
    fontSize: '20px',
    padding: '3px',
    borderRadius: '4px',
    color: 'white',
    backgroundColor: '#DB4343',
    cursor: 'pointer',
    userSelect: 'none',
    $nest: {
      '&:hover': {
        backgroundColor: '#DE3030',
      },
    },
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


