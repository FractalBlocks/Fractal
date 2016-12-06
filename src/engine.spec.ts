import F from './index'
import { ModuleDef, Model, Interfaces } from './core'
import { Context } from './composition'
import { newStream } from './stream'

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
    set: (ctx: Context) => (n: number) => ctx.do$.set(actions.Set(n)),
    inc: (ctx: Context) => () => ctx.do$.set(actions.Inc()),
  }

  let interfaces: Interfaces<MainModel> = {
    event: (ctx, s) => ({
      tagName: s.key,
      content: 'Typescript is awesome!! ' + s.count,
      subscribe: inputs.inc(ctx),
      a: inputs
    }),
  }

  let mDef: ModuleDef<MainModel> = {
    name,
    init,
    inputs,
    actions,
    interfaces,
  }

  let value$ = newStream<any>(undefined)
  function onValue(val) {
    value$.set(val)
  }

  let engine = F.run({
    module: mDef,
    interfaces: {
      event: F.interfaces.event(onValue),
    }
  })

  it('should have initial state', function() {
    let value = value$.get()
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Typescript is awesome!! 0')
  })

  it('should react to input', (done) => {
    value$.subscribe(value => {
      expect(value.content).toBe('Typescript is awesome!! 1')
      done()
    })
    value$.get().subscribe()
  })

})
