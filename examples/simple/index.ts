import { run, Model, Context, Interfaces, ModuleDef } from '../../src'
import viewHandler from '../../src/interfaces/view'


let name = 'Main'

interface MainModel extends Model {
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

let interfaces: Interfaces<MainModel> = {
  event: (ctx, s) => ({
    tagName: s.key,
    content: 'Typescript is awesome!! ' + s.count,
    subscribe: inputs.inc(ctx),
  }),
}

let mDef: ModuleDef<MainModel> = {
  name,
  init,
  inputs,
  actions,
  interfaces,
}

let engine = run({
  module: mDef,
  interfaces: {
    event: viewHandler('#app'),
  }
})
