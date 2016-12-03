import F from '../src'
import { ModuleDef, Model } from '../src/core'

describe('Engine functionality', function() {

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
    set: ctx => (n: number) => ctx.do$(actions.Set(n)),
    inc: ctx => () => ctx.do$(actions.Inc()),
  }

  let interfaces = {
    event: (ctx, s) => ({
      tagName: s.key,
      content: 'Typescript is awesome!! ' + s.count,
      subscribe: inputs.inc(ctx),
    }),
  }

  let moduleDef: ModuleDef<MainModel> = {
    name,
    init,
    inputs,
    actions,
    interfaces,
  }

  let module = F.def(moduleDef)

  let value = undefined
  function onValue(val) {
    value = val
  }

  let engine = F.run({
    module,
    interfaces: {
      event: F.interfaces.event(onValue),
    }
  })

  it('should have initial state', function() {
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Typescript is awesome!! 0')
  })

  it('should react to input', () => {
    value.handler()
  })

})
