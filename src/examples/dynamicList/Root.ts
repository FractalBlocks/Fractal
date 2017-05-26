import { Actions, Inputs, ev, _, Interfaces } from '../../core'
import { action, act } from '../../component'
import { StyleGroup } from '../../style'
import { View, h } from '../../interfaces/view'

export const name = 'Root'

export const state = {
  text: '',
  list: [],
}

export type S = typeof state

export const inputs: Inputs<S> = ctx => ({
  action: action(actions),
  inputKeyup: ([keyCode, text]) =>
    keyCode === 13 && text !== ''
    ? [
      actions.SetText(''),
      actions.New(text),
    ] : actions.SetText(text),
})

export const actions: Actions<S> = {
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
              click: act(ctx, 'Remove', idx),
            },
          }, 'remove'),
        ]),
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

export const groups = { style }
