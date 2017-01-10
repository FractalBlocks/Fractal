import { ModuleDef, Context, run } from './index'
import { eventHandler, EventInterface } from './interfaces/event'
import { newStream } from './stream'

describe('Engine functionality', function() {

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

  let event: EventInterface =
    (ctx, s: MainModel) => ({
      tagName: s.key,
      content: 'Typescript is awesome!! ' + s.count,
      subscribe: inputs.inc(ctx),
    })

  let mDef: ModuleDef<MainModel> = {
    name,
    init,
    inputs,
    actions,
    interfaces: {
      event,
    },
  }

  let value$ = newStream<any>(undefined)
  function onValue(val) {
    value$.set(val)
  }

  let engine = run({
    module: mDef,
    interfaces: {
      event: eventHandler(onValue),
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
