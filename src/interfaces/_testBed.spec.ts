// Test bed component

import { run, ModuleDef, Context, Interface } from '../index'


export default function (interfaceObjBuilder, interfaceHandler) {

  let name = 'TestBed'

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
    set: (ctx: Context) => (n: number) => ctx.do$.set(actions.Set(n)),
    inc: (ctx: Context) => () => ctx.do$.set(actions.Inc()),
  }

  let mDef: ModuleDef<MainModel> = {
    name,
    init,
    inputs,
    actions,
    interfaces: {
      interfaceObj: interfaceObjBuilder(inputs),
    },
  }

  return run({
    module: mDef,
    interfaces: {
      interfaceObj: interfaceHandler,
    },
  })
}
