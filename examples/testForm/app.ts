import { Context, Component, stateOf, interfaceOf, clone } from '../../src'
import { props, vw } from '../../utils/component'
import { styleGroup, StyleGroup } from '../../utils/style'
import { ViewInterface } from '../../interfaces/view'
import h from 'snabbdom/h'

import TextField from './textField'
import Button from './button'

let name = 'Main'


let questions = [
  '1 + 1?',
  'the secret of life?',
  'what is the best tool for doing Web Dev?',
  '2 * 2?',
]

let answers = [
  '2',
  'work hard!',
  'Fractal',
  '4',
]

let questionCmp = <any> questions.map(
  q => props(TextField, { placeholder: q })
)

let components = {
  ...questionCmp,
  button: Button,
}

let state = {
  active: false,
}

let actions = {
  SetActive: () => s => {
    s.active = true
    return s
  },
}

let inputs = (ctx: Context) => ({
  button_click: () => actions.SetActive(),
})

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.questions]: true },
    }, Object.keys(questionCmp).map(
        i => vw(ctx, i)
      ),
    ),
    h('p', s.active ? 'yep' : 'nope'),
    vw(ctx, 'button'),
  ])
}

let style: any = {
  base: {
    width: '400px',
  },
  questions: {},

}

let mDef: Component = {
  name,
  groups: {
    style,
  },
  state,
  components,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

