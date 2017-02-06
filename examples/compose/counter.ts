import { Context, Component } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/style'

import { ViewInterface } from '../../src/interfaces/view'
import h from 'snabbdom/h'

let name = 'Main'

interface MainModel {
  key: string
  count: number
}

let init = ({key}) => ({
  key,
  count: 0,
})

let actions = {
  Set: (count: number) => (state: MainModel) => {
    state.count = count
    return state
  },
  Inc: () => (state: MainModel) => {
    state.count ++
    return state
  },
}

let inputs = {
  set: (ctx: Context) => (n: number) => ctx.do(actions.Set(n)),
  inc: (ctx: Context) => () => ctx.do(actions.Inc()),
}

let view: ViewInterface = (ctx, s: MainModel) =>

h('div', {
  key: name,
  class: { [style.base]: true },
}, [
  h('div', {
    class: { [style.count]: true },
    on: {
      click: inputs.inc(ctx),
    },
  }, `${s.count}`),
  h('div', {
    class: { [style.reset]: true },
    on: {
      click: () => inputs.set(ctx)(0),
    },
  }, 'reset'),
])


let styleObj: StyleGroup = {
  base: {
    width: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#C1C6CC',
  },
  count: {
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    backgroundColor: '#3232F2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reset: {
    padding: '4px',
    color: 'white',
    fontSize: '18px',
    backgroundColor: '#EA1818',
  },
}

let style: any = styleGroup(styleObj, name)


let mDef: Component<MainModel> = {
  name,
  init,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef
