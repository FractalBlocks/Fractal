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
  Task,
  TaskHandler,
  DispatchData,
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
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
  task: (): Task => ['log', { info: 'info', cb: ev(ctx, 'inc') }],
})

let event: EventInterface =
  (ctx, s) => ({
    tagName: s.key,
    content: 'Fractal is awesome!! ' + s.count,
    handler: ev(ctx, 'inc'),
    handler2: ev(ctx, 'task'),
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
    taskRunners: {},
    interfaceStreams: {},
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

  it('Should put an entry in warnLog when warn function is invoked', () => {
    let warn = ['child', 'warn 1']
    rootCtx.warn(warn[0], warn[1])
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

  let state

  it('Should get the state from a certain component (stateOf)', () => {
    state = stateOf(rootCtx, 'child')
    expect(state.count).toEqual(0)
  })

  it('Should get an interface message from a certain component (stateOf)', () => {
    expect(interfaceOf(rootCtx, 'child', 'event')).toEqual(event(rootCtx, state))
  })

})

describe('One Component + module functionality', function () {

  let value$ = newStream<any>(undefined)
  function onValue(val) {
    value$.set(val)
  }

  let taskLog = []

  let logTask: TaskHandler = log => mod => (data: {info: any, cb: DispatchData}) => {
    log.push(data.info)
    mod.dispatch(data.cb)
  }

  let app = run({
    root,
    tasks: {
      log: logTask(taskLog),
    },
    interfaces: {
      event: eventHandler(onValue),
    }
  })

  it('should have initial state', () => {
    let value = value$.get()
    expect(value.tagName).toBe('Main')
    expect(value.content).toBe('Fractal is awesome!! 0')
  })

  // Events should dispatch actions and intefaces are recalculated

  let value

  it('should react to an event (dispatch function)', done => {
    value$.subscribe(value => {
      expect(value.content).toBe('Fractal is awesome!! 1')
      done()
    })
    // extract value and dispatch interface handlers
    value = value$.get()
    value._dispatch(value.handler)
  })

  it('Should put an entry in errorLog when error function is invoked', () => {
    let error = ['child', 'error 1']
    app.ctx.error(error[0], error[1])
    let lastError = app.ctx.errorLog[app.ctx.errorLog.length - 1]
    expect(lastError).toEqual(error)
  })

  it('Should delegate warn function', () => {
    let warn = ['child', 'warn 1']
    app.ctx.warn(warn[0], warn[1])
    let lastWarn = app.ctx.warnLog[app.ctx.warnLog.length - 1]
    expect(lastWarn).toEqual(warn)
  })

  it('should log an error when try to dispatch an event of an inexistent module', () => {
    value._dispatch(['someId', 'someEvent'])
    expect(app.ctx.errorLog[app.ctx.errorLog.length - 1]).toEqual([
      'dispatch',
      `there are no module with id 'someId'`,
    ])
  })

  // Events should dispatch tasks to its handlers and those can dispatch events

  it('Should dispatch an executable (action / task) asyncronusly from an event when it return a Task with EventData', done => {
    value$.removeSubscribers()
    value$.subscribe(value => {
      expect(value.content).toBe('Fractal is awesome!! 2')
      done()
    })
    value._dispatch(value.handler2)
    expect(taskLog[taskLog.length - 1]).toEqual('info')
  })

  it('should log an error when try to dispatch an inexistent event of a module', () => {
    value._dispatch(['Main', 'someEvent'])
    expect(app.ctx.errorLog[app.ctx.errorLog.length - 1]).toEqual([
      'dispatch',
      `there are no event with id 'someEvent' in module 'Main'`,
    ])
  })

})
