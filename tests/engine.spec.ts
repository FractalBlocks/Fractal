import F from '../src'
import { ModuleDef, Model } from '../src/core'

describe('Engine functionality', function() {

  interface MainModel extends Model {
    count: number
  }

  let moduleDef: ModuleDef<MainModel> = {
    name: 'Main',
    init: ({key}): MainModel => ({
      key,
      count: 12,
    }),
    inputs: {
      data: (ctx, actions, data) => actions.SetData(data),
    },
    actions: {
      SetData: (data, state) => {
        return state
      },
    },
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
