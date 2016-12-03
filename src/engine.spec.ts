import F from '../src'
import { ModuleDef, Model } from '../src/core'

describe('Engine functionality', function() {

  interface MainModel extends Model {
    count: number
  }

  let actions = {
    SetCount: (count: number) => (state: MainModel) => {
      state.count = count
      return state
    },
  }

  let moduleDef: ModuleDef<MainModel> = {
    name: 'Main',
    init: ({key}) => ({
      key,
      count: 12,
    }),
    inputs: {
      data: (ctx, data) => actions.SetCount(data),
    },
    actions,
    interfaces: {
      event: (ctx, i, s) => ({
        tagName: s.key,
        content: 'Typescript is awesome!! ' + s.count,
        // handler: i.data,
      }),
    },
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

  it('Should have initial state', function() {
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Typescript is awesome!!')
  })
})

// ------


// interface M {
//   a: {
//     [someAction: string]: { (): number }
//   }
// }

// class Actions {
//   [someAction: string]: { (): number }
// }

// let c: M = {
//   a: class extends Actions {
//     s = () => 9
//     d = () => 9
//   },
// }

// let b = new c.a()

// b.d


// class Module {

// }

