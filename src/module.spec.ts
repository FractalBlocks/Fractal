import { Component, Context, run, getState, getInterface, dispatch } from './index'
import { eventHandler, EventInterface } from './interfaces/event'
import { newStream } from './stream'

describe('1 Component + module functionality', function() {

  let name = 'Main'

  let state = ({key}) => ({
    key,
    count: 0,
  })

  let actions = {
    Set: (count: number) => s => {
      s.count = count
      return s
    },
    Inc: () => s => {
      s.count ++
      return s
    },
  }

  let inputs = (ctx: Context) => ({
    set: (n: number) => ctx.do(actions.Set(n)),
    inc: () => ctx.do(actions.Inc()),
  })

  let event: EventInterface =
    (ctx, s) => ({
      tagName: s.key,
      content: 'Fractal is awesome!! ' + s.count,
      handler: dispatch(ctx, 'inc'),
    })

  let root: Component = {
    name,
    state,
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

  let app = run({
    root,
    interfaces: {
      event: eventHandler(onValue),
    }
  })

  it('should have initial state', function() {
    let value = value$.get()
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Fractal is awesome!! 0')
  })

  it('should react to input', done => {
    value$.subscribe(value => {
      expect(value.content).toBe('Fractal is awesome!! 1')
      done()
    })
    // extract value and dispatch handler
    value$.get().handler
  })

})
