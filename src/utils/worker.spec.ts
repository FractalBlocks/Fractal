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
import {
  runWorker,
  WorkerAPI,
  workerHandler,
  workerLog,
  workerListener,
} from '../../src/utils/worker'
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

  let disposeLogFn
  let taskLog = []

  let logTask: Handler = log => mod => ({
    state: undefined,
    handle: (data: {info: any, cb: DispatchData}) => {
      log.push(data.info)
      mod.dispatch(data.cb)
    },
    dispose: () => {
      if (disposeLogFn) {
        disposeLogFn()
      }
    },
  })

  let disposeValue2Fn
  let value2Handler: Handler = log => mod => ({
    state: undefined,
    handle: data => {
    },
    dispose: () => {
      if (disposeValue2Fn) {
        disposeValue2Fn()
      }
    },
  })

  let worker = runWorker({
    worker: mainAPI,
    tasks: {
      log: logTask(taskLog),
    },
    interfaces: {
      value: valueHandler(onValue),
      value2: value2Handler(onValue),
    },
    warn: logCb,
    error: logCb,
  })

  let disposeFn

  let workerModule = run({
    root,
    init: mod => workerListener(mod, workerAPI),
    destroy: () => {
      if (disposeFn) {
        disposeFn()
      }
    },
    tasks: {
      log: workerHandler('task', 'log', workerAPI),
    },
    interfaces: {
      value: workerHandler('interface', 'value', workerAPI),
      value2: workerHandler('interface', 'value2', workerAPI),
    },
    warn: workerLog('warn', workerAPI),
    error: workerLog('error', workerAPI),
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

  it('should log an error when try to dispatch an task that has no task handler', done => {
    valueFn = undefined
    logFn = log => {
      expect(log).toEqual([
        'execute',
        `there are no task handler for 'wrongTask' in component 'Main' from space 'Main'`,
      ])
      done()
    }
    lastValue._dispatch(lastValue.wrongTask)
  })

  it('should merge a component via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.merge('newComponent', root)
    // when implemented:
    // expect(workerModule.ctx.components['Main$newComponent']).toBeDefined()
  })

  it('should merge a component index via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.mergeAll({
      newComponent: root,
    })
  })

  it('should unmerge a component via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.unmerge('newComponent')
  })

  it('should unmerge a component index via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.unmergeAll(['newComponent'])
  })

  // dispose module

  it('should call dispose in task handlers via worker', done => {
    disposeLogFn = () => {
      done()
    }
    workerModule.taskHandlers['log'].dispose()
  })

  it('should call dispose in handlers via worker', done => {
    disposeValue2Fn = () => {
      done()
    }
    workerModule.interfaceHandlers['value2'].dispose()
  })

  it('should call destroy hook when dispose a module and dispose it', done => {
    disposeFn = () => {
      done()
    }
    worker.moduleAPI.dispose()
  })

})
