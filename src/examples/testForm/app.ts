import {
  Component,
  stateOf,
  clone,
  execute,
  Actions,
  Inputs,
} from '../../core'
import { pipe, props, vw, setGroup } from '../../utils/component'
import { StyleGroup, mergeStyles } from '../../utils/style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

import TextField from './textField'
import Button from './button'

let name = 'Main'

let questions = [
  '1 + 1?',
  'the secret of life?',
  'what is the best tool for Web Dev?',
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

interface Model {
  correct: true | false | 'unknown'
}

let state: Model = {
  correct: 'unknown',
}

let actions: Actions = {
  SetCorrect: isCorrect => s => {
    s.correct = isCorrect
    return s
  },
  Clear: () => s => ''
}

let inputs: Inputs = ctx => ({
  $testBtn_click: () => {
    let result = Object.keys(questions).map((q, idx) => {
      let isCorrect = stateOf(ctx, q).value === answers[idx]
      execute(ctx, ctx.id + '$' + q, TextField.actions.SetError(!isCorrect))
      return isCorrect
    }).reduce((a, r) => a && r, true)
    return actions.SetCorrect(result)
  },
  $clearBtn_click: () => {
    Object.keys(questions).forEach(
      i => execute(ctx, ctx.id + '$' + i, [
        TextField.actions.SetValue(''),
        TextField.actions.SetError(false),
      ])
    )
    return actions.Clear()
  },
})

let view: View = (ctx, s: Model) => {
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
      h('p', {
        class: {
          [style.testText]: true,
          [style.testCorrect]: s.correct === true,
          [style.testFailed]: s.correct === false,
        }
      },
        s.correct === 'unknown'
        ? 'Editing'
        : s.correct
        ? 'Correct'
        : 'There are mistakes!'
      ),
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
  questions: {},
  testText: {
    color: 'white',
    padding: '5px',
    borderRadius: '4px',
    display: 'inline-block',
    backgroundColor: '#5E6060',
  },
  testCorrect: {
    backgroundColor: '#22911E',
  },
  testFailed: {
    backgroundColor: '#de3339',
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

