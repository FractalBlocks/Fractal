import {
  Actions,
  Inputs,
  Interfaces,
  clone,
  assoc,
  props,
  styles,
  StyleGroup,
  pipe,
  compGroup,
  Components,
} from '../../core'
import { View, h } from '../../interfaces/view'

import * as TextFieldBase from './TextField'
import * as ButtonBase from './Button'

export const name = 'Root'

let questions = [
  '1 + 1?',
  'the secret of life?',
  'what is the best tool for Web Dev?',
  '2 * 2?',
].map((q, idx) => [idx + '', q])

let answers = [
  '2',
  'work hard!',
  'Fractal',
  '4',
]

let TextField = styles({
  base: {
    width: 'calc(100% - 30px)',
    margin: '15px',
  },
})(clone(TextFieldBase))

let TestBtn = props('Test')(clone(ButtonBase))

let ClearBtn = pipe(
  styles({
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
  }),
  props('Clear'),
)(clone(ButtonBase))

export const components: Components = {
  ...compGroup('Form', questions, q => props({ placeholder: q })(clone(TextField))),
  TestBtn,
  ClearBtn,
}

export interface S {
  correct: true | false | 'unknown'
}

export const state: S = {
  correct: 'unknown',
}

export const inputs: Inputs<S> = ({ ctx, stateOf, toChild, comps }) => ({
  $TestBtn_click: async () => {
    let results = comps('Form').getState('value')
    let result = Object.keys(results).map(name => {
      name = <any> parseInt(name)
      let isCorrect = results[name] === answers[name]
      toChild('Form_' + name, 'action', ['SetError', !isCorrect])
      return isCorrect
    }).reduce((a, r) => a && r, true)
    return actions.SetCorrect(result)
  },
  $ClearBtn_click: async () => {
    comps('Form').broadcast('action', ['Reset'])
    return actions.Clear()
  },
})

export const actions: Actions<S> = {
  SetCorrect: isCorrect => s => {
    s.correct = isCorrect
    return s
  },
  Clear: () => assoc('correct')('unknown'),
}

let view: View<S> = ({ ctx, vw, vws }) => s => {
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
      }, vws('Form')),
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
      vw('TestBtn'),
      vw('ClearBtn'),
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
