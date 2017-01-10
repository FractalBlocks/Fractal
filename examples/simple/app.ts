import { Context, ModuleDef } from '../../src'
import { styleGroup, StyleGroup } from '../../src/utils/styles'

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
])


let styleObj: StyleGroup = {
  base: {
    padding: '10px',
    backgroundColor: 'grey',
  },
  count: {
    width: '30px',
    height: '30px',
    margin: '10px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: 'blue',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

let style: any = styleGroup(styleObj, name)


let mDef: ModuleDef<MainModel> = {
  name,
  init,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

