import {
  Component,
  Context,
  run,
  merge,
  stateOf,
  interfaceOf,
  ev,
  Executable,
  createContext,
  Update,
} from './index'
import { eventHandler, EventInterface } from './interfaces/event'
import { newStream } from './stream'

// Component definition to perform tests

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

let events = (ctx: Context) => ({
  set: (n: number) => ctx.do(actions.Set(n)),
  inc: () => ctx.do(actions.Inc()),
})

let event: EventInterface =
  (ctx, s) => ({
    tagName: s.key,
    content: 'Fractal is awesome!! ' + s.count,
    handler: ev(ctx, 'inc'),
  })

let root: Component = {
  name,
  state,
  events,
  actions,
  interfaces: {
    event,
  },
}

describe('Context functions', function () {

  let doLog = []

  let rootCtx: Context = {
    id: 'Main',
    do: (executable: Executable) => doLog.push(executable),
    components: {}, // component index
    // error and warning handling
    warn: (source, description) => {
      rootCtx.warnLog.push([source, description])
      console.warn(`source: ${source}, description: ${description}`)
    },
    error: (source, description) => {
      rootCtx.errorLog.push([source, description])
      console.error(`source: ${source}, description: ${description}`)
    },
    warnLog: [],
    errorLog: [],
  }

  let ctx: Context
  it('Should create a child context (createContext)', () => {
    ctx = createContext(rootCtx, 'child')
    expect(ctx).toBeDefined()
  })

  it('Should delegate do function (executables)', () => {
    let update: Update = (state) => state
    ctx.do(update)
    let lastDo = doLog[doLog.length - 1]
    expect(lastDo).toEqual(update)
  })

  it('Should delegate warn function', () => {
    let warn = ['child', 'warn 1']
    ctx.warn(warn[0], warn[1])
    let lastWarn = rootCtx.warnLog[rootCtx.warnLog.length - 1]
    expect(lastWarn).toEqual(warn)
  })

  it('Should delegate error function', () => {
    let error = ['child', 'error 1']
    ctx.error(error[0], error[1])
    let lastError = rootCtx.errorLog[rootCtx.errorLog.length - 1]
    expect(lastError).toEqual(error)
  })

  it('Should merge a component to context (merge)', () => {
    merge(rootCtx, 'child', root)
    expect(ctx.components[`Main$child`]).toBeDefined()
  })

  it('Should overwrite a component if has the same name and log a warning', () => {
    ctx.components[`Main$child`].state.count = 17
    merge(rootCtx, 'child', root)
    expect(ctx.components[`Main$child`]).toBeDefined()
    // Should overwrite
    expect(ctx.components[`Main$child`].state.count).toEqual(0)
    expect(rootCtx.warnLog[rootCtx.warnLog.length - 1])
      .toEqual(['merge', `module 'Main' has overwritten module 'Main$child'`])
  })

  it('Should get the state from a certain component (stateOf)', () => {
    expect(stateOf(rootCtx, 'child')['count']).toEqual(0)
  })



})

describe('One Component + module functionality', function () {

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

  it('should have initial state', () => {
    let value = value$.get()
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Fractal is awesome!! 0')
  })

  let value

  it('should react to input (dispatch function)', done => {
    value$.subscribe(value => {
      expect(value.content).toBe('Fractal is awesome!! 1')
      done()
    })
    // extract value and dispatch handler
    value = value$.get()
    value._dispatch(value.handler)
  })

  it('should log an error when try to dispatch an event of an inexistent module', () => {
    value._dispatch(['someId', 'someEvent'])
    expect(app.ctx.errorLog[app.ctx.errorLog.length - 1]).toEqual([
      'dispatch',
      `there are no module with id 'someId'`,
    ])
  })

  it('should log an error when try to dispatch an inexistent event of a module', () => {
    value._dispatch(['Main', 'someEvent'])
    expect(app.ctx.errorLog[app.ctx.errorLog.length - 1]).toEqual([
      'dispatch',
      `there are no event with id 'someEvent' in module 'Main'`,
    ])
  })

})
