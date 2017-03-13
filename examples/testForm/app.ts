import { Context, Component, stateOf, interfaceOf, clone, execute } from '../../src'
import { pipe, props, vw, setGroup } from '../../utils/component'
import { styleGroup, StyleGroup, mergeStyles } from '../../utils/style'
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

let inputStyle = mergeStyles(TextField.groups['style'], {
  base: {
    width: 'calc(100% - 30px)',
    margin: '15px',
  },
})

let questionCmp = <any> questions.map(
  q => pipe(
    props({ placeholder: q }),
    setGroup('style', inputStyle),
  )(clone(TextField))
)

let clearBtnStyle = mergeStyles(Button.groups['style'], {
  base: {
    marginTop: '5px',
    color: '#5E6060',
    backgroundColor: 'none',
    $nest: {
      '&:hover': {
        color: '#1E4691',
        backgroundColor: 'none',
      },
    },
  },
})

let testBtn = props('Test')(clone(Button))

let clearBtn = pipe(
  props('Clear'),
  setGroup('style', clearBtnStyle)
)(clone(Button))

let components = {
  ...questionCmp,
  testBtn,
  clearBtn,
}

let state = {
  active: false,
}

let actions = {
  SetActive: () => s => {
    s.active = true
    return s
  },
  Clear: () => s => {
    s.active = false
    return s
  }
}

let inputs = (ctx: Context) => ({
  $testBtn_click: () => actions.SetActive(),
  $clearBtn_click: () => {
    Object.keys(questions).forEach(
      i => execute(ctx, ctx.id + '$' + i, TextField.actions.SetValue(''))
    )
    return actions.Clear()
  },
})

let view: ViewInterface = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.form]: true },
    }, [
      h('div', {
        class: { [style.questions]: true },
      }, Object.keys(questionCmp).map(
          i => vw(ctx, i)
        ),
      ),
      h('p', s.active ? 'yep' : 'nope'),
      vw(ctx, 'testBtn'),
      vw(ctx, 'clearBtn'),
    ]),
  ])
}

let style: StyleGroup = {
  base: {
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  form: {
    width: '400px',
  },
  questions: {
  },
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

