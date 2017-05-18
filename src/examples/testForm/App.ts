import {
  Actions,
  Inputs,
  Interfaces,
  clone,
} from '../../core'
import { props, vw, setGroup, stateOf, toChild } from '../../component'
import { pipe, assoc } from '../../fun'
import { StyleGroup, mergeStyles } from '../../style'
import { View, h } from '../../interfaces/view'

import * as TextField from './TextField'
import * as Button from './Button'

export const name = 'Main'

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

export const components = {
  ...questionCmp,
  testBtn,
  clearBtn,
}

export interface S {
  correct: true | false | 'unknown'
}

export const state: S = {
  correct: 'unknown',
}

export const actions: Actions<S> = {
  SetCorrect: isCorrect => s => {
    s.correct = isCorrect
    return s
  },
  Clear: () => assoc('correct')('unknown'),
}

export const inputs: Inputs<S> = ctx => ({
  $testBtn_click: () => {
    let result = Object.keys(questions).map((q, idx) => {
      let isCorrect = stateOf(ctx, q).value === answers[idx]
      toChild(ctx, q, 'action', ['SetError', !isCorrect])
      return isCorrect
    }).reduce((a, r) => a && r, true)
    return actions.SetCorrect(result)
  },
  $clearBtn_click: () => {
    Object.keys(questions).forEach(
      i => {
        toChild(ctx, i, 'action', ['SetValue', ''])
        toChild(ctx, i, 'action', ['SetError', false])
      }
    )
    return actions.Clear()
  },
})

let view: View<S> = (ctx, s) => {
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

export const interfaces: Interfaces = { view }

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

export const groups = { style }
