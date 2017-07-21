import {
  Component,
  Task,
  run,
  Handler,
  EventData,
  HandlerInterface,
  Inputs,
} from '../core'
import {
  runWorker,
  WorkerAPI,
  workerHandler,
  workerLog,
  workerListener,
} from './worker'
import { valueHandler, ValueInterface } from '../interfaces/value'

describe('Utilities for running fractal inside workers', async () => {

  let name = 'Main'

  let state = 0

  let actions = {
    Set: (count: number) => () => count,
    Inc: () => s => s + 1,
  }

  let inputs: Inputs<number> = ({ ctx, ev }) => ({
    set: async (n: number) => actions.Set(n),
    inc: async () => actions.Inc(),
    task: async (): Promise<Task> => ['log', { info: 'info', cb: ev('inc') }],
    wrongTask: async (): Promise<Task> => ['wrongTask', {}],
  })

  let childValue: ValueInterface<any> =
    ({ ctx, ev }) => s => ({
      tagName: ctx.id,
      content: 'Fractal is awesome!! ' + s,
      inc: ev('inc'),
      task: ev('task'),
      wrongTask: ev('wrongTask'),
    })

  let root: Component<any> = {
    name,
    groups: {
      group: 'MainGroup',
    },
    state,
    inputs,
    actions,
    interfaces: {
      value: childValue,
    },
  }

  // empty handler helper
  let emptyHandler: HandlerInterface = mod => ({
    state: undefined,
    handle: () => {},
    dispose: () => {},
  })

  // emulate worker thread API to main
  let workerAPI: WorkerAPI = {
    postMessage: data => mainAPI.onmessage({ data }),
  }

  // emulate main thread API to worker
  let mainAPI: WorkerAPI = {
    postMessage: data => workerAPI.onmessage({ data }),
  }

  let groupFn
  let disposeGroupFn
  let groupHandler: Handler = () => mod => ({
    state: undefined,
    handle: ([id, group]) => {
      if (groupFn) {
        mod.setGroup(id, 'group', group)
        groupFn(group)
      }
    },
    dispose: () => {
      if (disposeGroupFn) {
        disposeGroupFn()
      }
    },
  })

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
    handle: (data: {info: any, cb: EventData}) => {
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
    groups: {
      group: groupHandler(),
    },
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
  let workerModule = await run({
    root,
    beforeInit: mod => {
      workerListener(mod, workerAPI)
    },
    destroy: () => {
      if (disposeFn) {
        disposeFn()
      }
    },
    groups: {
      group: workerHandler('group', 'group', workerAPI),
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

  async function setup (valueFn, logFn?) {
    // emulate worker thread API to main
    let workerAPI: WorkerAPI = {
      postMessage: data => mainAPI.onmessage({ data }),
    }
    // emulate main thread API to worker
    let mainAPI: WorkerAPI = {
      postMessage: data => workerAPI.onmessage({ data }),
    }
    let groupFn
    let disposeGroupFn
    let groupHandler: Handler = () => mod => ({
      state: undefined,
      handle: ([id, group]) => {
        if (groupFn) {
          mod.setGroup(id, 'group', group)
          groupFn(group)
        }
      },
      dispose: () => {
        if (disposeGroupFn) {
          disposeGroupFn()
        }
      },
    })

    let disposeLogFn
    let taskLog = []

    let logTask: Handler = log => mod => ({
      state: undefined,
      handle: (data: {info: any, cb: EventData}) => {
        log.push(data.info)
        mod.dispatch(data.cb)
      },
      dispose: () => {
        if (disposeLogFn) {
          disposeLogFn()
        }
      },
    })

    let worker = runWorker({
      worker: mainAPI,
      groups: {
        group: groupHandler(),
      },
      tasks: {
        log: logTask(taskLog),
      },
      interfaces: {
        value: valueHandler(v => valueFn(v, taskLog)),
        // value2: value2Handler(onValue),
      },
      warn: logFn,
      error: logFn,
    })

    let disposeFn
    let workerModule = await run({
      root,
      beforeInit: mod => {
        workerListener(mod, workerAPI)
      },
      destroy: () => {
        if (disposeFn) {
          disposeFn()
        }
      },
      groups: {
        group: workerHandler('group', 'group', workerAPI),
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

    return {
      worker,
      workerModule,
    }
  }

  it('should nest the space', done => {
    groupFn = group => {
      expect(group).toBe('MainGroup')
      done()
    }
    run({
      root,
      beforeInit: mod => {
        workerListener(mod, workerAPI)
      },
      destroy: () => {
        if (disposeFn) {
          disposeFn()
        }
      },
      groups: {
        group: workerHandler('group', 'group', workerAPI),
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
  })

  it('should run fractal over a worker API', () => {
    expect(lastValue.tagName).toBe('Main')
    expect(lastValue.content).toBe('Fractal is awesome!! 0')
  })

  it('should react to inputs', done => {
    let count = 0
    setup(value => {
      if (count === 1) {
        expect(value.content).toBe('Fractal is awesome!! 1')
        done()
      } else {
        count++
        value._dispatch(value.inc)
      }
    })
  })

  // it('should dispatch tasks', () => {})

  it('Should put an entry in errorLog when error function is invoked', done => {
    let error = ['child', 'error 1']
    logFn = log => {
      expect(log).toEqual(error)
      done()
    }
    workerModule.ctx.error(error[0], error[1])
  })

  it('should dispatch an executable (action / task) asyncronusly from an event when it return a Task with EventData', done => {
    let count = 0
    setup((value, taskLog) => {
      if (count === 1) {
        expect(value.content).toBe('Fractal is awesome!! 1')
        expect(taskLog[taskLog.length - 1]).toEqual('info')
        done()
      } else {
        count++
        value._dispatch(value.task)
      }
    })
  })

  it('should log an error when try to dispatch an task that has no task handler', done => {
    setup(value => {
      value._dispatch(value.wrongTask)
    }, (source, description) => {
      expect([source, description]).toEqual([
        'execute',
        `there are no task handler for 'wrongTask' in component 'Main' from space 'Main'`,
      ])
      done()
    })
  })

  it('should nest a component via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.nest('newComponent', root, true)
    worker.moduleAPI.nest('newComponent', root)
    // when implemented:
    // expect(workerModule.ctx.components['Main$newComponent']).toBeDefined()
  })

  it('should nest a component index via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.nestAll({
      newComponent: root,
    }, true)
    worker.moduleAPI.nestAll({
      newComponent: root,
    })
  })

  it('should unnest a component via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.unnest('newComponent')
  })

  it('should unnest a component index via moduleAPI, UNIMPLEMENTED', done => {
    logFn = log => {
      expect(log).toEqual([
        'workerListener',
        `unimplemented method`,
      ])
      done()
    }
    worker.moduleAPI.unnestAll(['newComponent'])
  })

  // dispose module

  it('should call dispose in group handlers via worker', done => {
    disposeGroupFn = () => {
      done()
    }
    workerModule.groupHandlers['group'].dispose()
  })

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
    let worker = runWorker({
      worker: mainAPI,
      groups: {
        group: emptyHandler,
      },
      tasks: {
        log: logTask(taskLog),
      },
      interfaces: {
        value: valueHandler(onValue),
        value2: value2Handler(onValue),
      },
      warn: logCb,
      error: logCb,
      destroy: () => {
        done()
      },
    })

    let disposeFn

    run({
      root,
      beforeInit: mod => workerListener(mod, workerAPI),
      destroy: () => {
        if (disposeFn) {
          disposeFn()
        }
      },
      groups: {
        group: workerHandler('group', 'group', workerAPI),
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

    worker.moduleAPI.dispose()
  })

})
