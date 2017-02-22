import {
  Context,
  Component,
  execute,
  Task,
  ev,
  run,
  Handler,
  DispatchData,
} from '../../src'
import { runWorker, WorkerAPI, workerHandler } from '../../src/utils/worker'
import { valueHandler, ValueInterface } from '../../src/interfaces/value'

describe('Utilities for running fractal inside workers', () => {

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
    set: (n: number) => actions.Set(n),
    inc: () => actions.Inc(),
    task: (): Task => ['log', { info: 'info', cb: ev(ctx, 'inc') }],
    wrongTask: (): Task => ['wrongTask', {}],
  })

  let childValue: ValueInterface =
    (ctx, s) => ({
      tagName: s.key,
      content: 'Fractal is awesome!! ' + s.count,
      inc: ev(ctx, 'inc'),
      task: ev(ctx, 'task'),
      wrongTask: ev(ctx, 'wrongTask'),
    })

  let root: Component = {
    name,
    state,
    inputs,
    actions,
    interfaces: {
      value: childValue,
    },
  }

  // emulate worker thread API to main
  let workerAPI: WorkerAPI = {
    postMessage: data => mainAPI.onmessage({ data }),
  }

  // emulate main thread API to worker
  let mainAPI: WorkerAPI = {
    postMessage: data => workerAPI.onmessage({ data }),
  }

  let lastLog

  let valueFn
  let lastValue
  function onValue (val) {
    lastValue = val
    if (valueFn) {
      valueFn(val)
    }
  }

  let logFn
  let logCb = (source, description) => {
    if (logFn) {
      logFn([source, description])
    }
  }

  let worker = runWorker({
    worker: mainAPI,
    interfaces: {
      value: valueHandler(onValue),
    },
    warn: logCb,
    error: logCb,
  })
  let taskLog = []

  let logTask: Handler = log => mod => ({
    state: undefined,
    handle: (data: {info: any, cb: DispatchData}) => {
      log.push(data.info)
      mod.dispatch(data.cb)
    },
    dispose: () => {},
  })
  let workerModule = run({
    root,
    init: mod => {
      // allows to dispatch inputs from the main thread
      workerAPI.onmessage = ev => {
        let data = ev.data
        if (data[0] === 'dispatch') {
          return mod.dispatch(data[1])
        }
      }
    },
    tasks: {
      log: logTask(taskLog),
    },
    interfaces: {
      value: workerHandler('interface', 'value', workerAPI),
    },
  })

  it('should run fractal over a worker API', () => {
    expect(lastValue.tagName).toBe('Main')
    expect(lastValue.content).toBe('Fractal is awesome!! 0')
  })

  it('should react to inputs', done => {
    valueFn = value => {
      expect(value.content).toBe('Fractal is awesome!! 1')
      done()
    }
    // extract value and dispatch interface handlers
    lastValue._dispatch(lastValue.inc)
  })

  // it('should dispatch tasks', () => {})

  it('Should put an entry in errorLog when error function is invoked', () => {
    let error = ['child', 'error 1']
    logFn = log => {
      expect(log).toEqual(error)
    }
    workerModule.ctx.error(error[0], error[1])
  })

  it('should dispatch an executable (action / task) asyncronusly from an event when it return a Task with EventData', done => {
    valueFn = value => {
      expect(value.content).toBe('Fractal is awesome!! 2')
      expect(taskLog[taskLog.length - 1]).toEqual('info')
      done()
    }
    lastValue._dispatch(lastValue.task)
  })

})
