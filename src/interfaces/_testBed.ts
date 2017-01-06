// Test bed component

import { run, ModuleDef, Model, Interfaces, Context, Interface } from '../index'


export default function (interfaceObjBuilder, interfaceHandler) {

  let name = 'TestBed'

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
    set: (ctx: Context) => (n: number) => ctx.do$.set(actions.Set(n)),
    inc: (ctx: Context) => () => ctx.do$.set(actions.Inc()),
  }

  let interfaces: Interfaces<MainModel> = {
    interfaceObj: interfaceObjBuilder(inputs),
  }

  let mDef: ModuleDef<MainModel> = {
    name,
    init,
    inputs,
    actions,
    interfaces,
  }

  return run({
    module: mDef,
    interfaces: {
      interfaceObj: interfaceHandler,
    },
  })
}
