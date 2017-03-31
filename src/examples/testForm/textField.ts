import { Context, Component } from '../../core'
import { action, act } from '../../utils/component'
import { StyleGroup, placeholderColor } from '../../utils/style'

import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

let name = 'TextField'

let state = {
  focus: false,
  error: false,
  placeholder: '',
  value: '',
}

let inputs = (ctx: Context) => ({
  action: action(actions),
})

let actions = {
  SetError: (error: boolean) => s => {
    s.error = error
    return s
  },
  SetValue: (value: string) => s => {
    s.value = value
    return s
  },
  SetFocus: (value: string) => s => {
    s.focus = value
    return s
  },
}

let view: View = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('input', {
      class: { [style.input]: true },
      attrs: { placeholder: s.placeholder },
      props: { value: s.value },
      on: {
        keydown: act(ctx, 'SetValue', ['target', 'value']),
        focus: act(ctx, ['SetFocus', true]),
        blur: act(ctx, ['SetFocus', false]),
      },
    }, `${s.count}`),
    h('div', {
      class: {
        [style.underlineContainer]: true,
        [style.underlineContainerNormal]: !s.error,
        [style.underlineContainerError]: s.error,
      },
    }, [
      h('div', {
        class: {
          [style.underline]: true,
          [style.underlineNormal]: s.focus && !s.error,
          [style.underlineError]: s.focus && s.error,
          [style.underlineActive]: s.focus,
        },
      }),
    ]),
  ])
}

const style: StyleGroup = {
  base: {
    width: '100%',
  },
  input: {
    width: '100%',
    border: '0px',
    outline: 'none',
    fontFamily: 'sans-serif',
    fontSize: '18px',
    color: '#5E6060',
    ...placeholderColor('#AEB8B9'),
  },
  underlineContainer: {
    width: '100%',
    height: '1px',
    display: 'flex',
    justifyContent: 'center',
  },
  underlineContainerNormal: {
    borderBottom: '1px solid #AEB8B9',
  },
  underlineContainerError: {
    borderBottom: '1px solid #d81f24',
  },
  underline: {
    width: '0px',
    height: '2px',
    transition: 'width 0.3s',
  },
  underlineNormal: {
    backgroundColor: '#3f51b5',
  },
  underlineError: {
    backgroundColor: '#d81f24',
  },
  underlineActive: {
    width: '100%',
  },
}

let mDef: Component = {
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

export default mDef
