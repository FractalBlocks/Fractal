import {
  Component,
  Module,
  Context,
  run,
  merge,
  interfaceOf,
  ev,
  Executable,
  createContext,
  Task,
  Handler,
  computeEvent,
  EventData,
  dispatch,
  unmerge,
  HandlerInterface,
  notifyInterfaceHandlers,
  clone,
  Inputs,
} from './index'
import { mergeStates } from '../reattach'
import { valueHandler, ValueInterface } from '../interfaces/value'

// Component definition to perform tests

let name = 'Main'

let state = 0

type S = typeof state

let actions = {
  Set: (count: number) => () => count,
  Inc: () => s => s + 1,
}

let inputs: Inputs<S> = ctx => ({
  set: (n: number) => actions.Set(n),
  setExtra: ([value, extra]) => actions.Set(value + extra),
  toParent: () => {},
  $child1_toParent: () => actions.Set(17), // child input detection
  $toParentGlobal: () => {},
  $$Child_toParentGlobal: () => actions.Set(21), // child input detection
  inc: () => actions.Inc(),
  action: ([name, value]) => actions[name](value), // generic action input
  dispatch: () => {
    dispatch(ctx, ev(ctx, 'inc'))
  },
  task: (): Task => ['log', { info: 'info', cb: ev(ctx, 'inc') }],
  wrongTask: (): Task => ['wrongTask', {}],
  executableListWrong: (): Executable<S>[] => [
    ['wrongTask2', {}],
  ],
  executableListTask: (): Executable<S>[] => [
    ['log', { info: 'info2', cb: ev(ctx, 'inc') }],
  ],
  executableListAction: (): Executable<S>[] => [
    actions.Inc(),
  ],
})

let _ = undefined // gap for undefined

let childValue: ValueInterface<any> =
  (ctx, s) => ({
    tagName: ctx.id,
    content: s,
    inc: ev(ctx, 'inc'),
    task: ev(ctx, 'task'),
    set: ev(ctx, 'set', 10),
    setFnAll: ev(ctx, 'set', _, '*'),
    setFnValue: ev(ctx, 'set', _, 'value'),
    setFnPath: ev(ctx, 'set', _, ['target', 'value']),
    setFnExtra: ev(ctx, 'setExtra', 5, 'value'),
    setFnGeneric: ev(ctx, 'action', 'Set', 'value'),
    setFnKeys: ev(ctx, 'set', _, [['a', 'b']]),
    setFnPathKeys: ev(ctx, 'set', _, ['p1', 'p2', ['a', 'b', 'c']]),
    setFnPaths: ev(ctx, 'set', _, [['p1', 'z'], ['a'], ['p1', 'p2', ['a', 'b', 'c']]]),
    toParent: ev(ctx, 'toParent'),
    toParentGlobal: ev(ctx, '$toParentGlobal'),
    wrongTask: ev(ctx, 'wrongTask'),
    dispatch: ev(ctx, 'dispatch'),
    executableListWrong: ev(ctx, 'executableListWrong'),
    executableListTask: ev(ctx, 'executableListTask'),
    executableListAction: ev(ctx, 'executableListAction'),
  })

let root: Component<S> = {
  name,
  state,
  inputs,
  actions,
  interfaces: {
    value: childValue,
  },
}

let emptyHandler: HandlerInterface = mod => ({
  state: undefined,
  handle: () => {},
  dispose: () => {},
})

describe('Context functions', function () {

  let lastLog

  let rootCtx: Context = {
    id: 'Main',
    name: 'Main',
    groups: {},
    groupHandlers: {},
    taskHandlers: {},
    interfaceHandlers: {},
    components: {}, // component index
    // error and warning handling
    warn: (source, description) => {
      lastLog = [source, description]
    },
    error: (source, description) => {
      lastLog = [source, description]
    },
  }

  let ctx: Context
  it('should create a child context (createContext)', () => {
    ctx = createContext(rootCtx, 'child')
    expect(ctx).toBeDefined()
  })

  it('should put an entry in warnLog when warn function is invoked', () => {
    let warn = ['child', 'warn 1']
    rootCtx.warn(warn[0], warn[1])
    expect(lastLog).toEqual(warn)
  })

  it('should put an entry in errorLog when error function is invoked', () => {
    let error = ['child', 'error 1']
    ctx.error(error[0], error[1])
    expect(lastLog).toEqual(error)
  })

  describe('ev function helper for sintetizing InputData', () => {

    it('should accept * for returning all the event object', () => {
      let data = ev(ctx, 'inputName', '*')
      expect(data).toEqual(['Main$child', 'inputName', '*', undefined])
    })

    it('should accept a property name for returning a part of the event object', () => {
      let data = ev(ctx, 'inputName', 'value')
      expect(data).toEqual(['Main$child', 'inputName', 'value', undefined])
    })

    it('should accept an extra argument', () => {
      let data = ev(ctx, 'inputName', 'value', 'extra')
      expect(data).toEqual(['Main$child', 'inputName', 'value', 'extra'])
    })

  })

  it('should merge a component to context (merge)', () => {
    merge(rootCtx, 'child', root)
    expect(ctx.components[`Main$child`]).toBeDefined()
  })

  it('should merge a component to context (merge) and mark it as dynamic', () => {
    merge(rootCtx, 'childDynamic', root, false)
    expect(ctx.components[`Main$childDynamic`]).toBeDefined()
  })

  it('should overwrite a component if has the same name and log a warning', () => {
    ctx.components[`Main$child`].state = 17
    merge(rootCtx, 'child', root)
    expect(ctx.components[`Main$child`]).toBeDefined()
    // should overwrite
    expect(ctx.components[`Main$child`].state).toEqual(0)
    expect(lastLog)
      .toEqual(['merge', `component 'Main' has overwritten component space 'Main$child'`])
  })

  it('should get an interface message from a certain component (interfaceOf)', () => {
    let state = rootCtx.components[rootCtx.id + '$child'].state
    expect(interfaceOf(rootCtx, 'child', 'value')).toEqual(childValue(createContext(rootCtx, 'child'), state))
  })

  it('should log an error if try to get an interface message from an inexistent component (interfaceOf)', () => {
    interfaceOf(rootCtx, 'wrong', 'value')
    expect(lastLog).toEqual([
      'interfaceOf',
      `there are no component space 'Main$wrong'`,
    ])
  })

  it('should log an error if try to get an inexistent interface message from a certain component (interfaceOf)', () => {
    interfaceOf(rootCtx, 'child', 'wrong')
    expect(lastLog).toEqual([
      'interfaceOf',
      `there are no interface 'wrong' in component 'Main' from space 'Main$child'`,
    ])
  })

})

describe('One Component + module functionality', function () {

  let valueFn
  let lastValue
  function onValue(val) {
    lastValue = val
    if (valueFn) {
      valueFn(val)
    }
  }

  let taskLog = []

  let logTask: Handler = log => mod => ({
    state: undefined,
    handle: (data: {info: any, cb: EventData}) => {
      log.push(data.info)
      mod.dispatch(data.cb)
    },
    dispose: () => {},
  })

  let lastLog
  let beforeInitCalled = false
  let initialized = false
  let disposed = false

  let app = run({
    root,
    beforeInit: () => {
      beforeInitCalled = true
    },
    init: () => {
      initialized = true
    },
    destroy: () => {
      disposed = true
    },
    tasks: {
      log: logTask(taskLog),
    },
    interfaces: {
      value: valueHandler(onValue),
    },
    warn: (source, description) => lastLog = [source, description],
    error: (source, description) => lastLog = [source, description],
  })

  it('should have initial state', () => {
    expect(lastValue.tagName).toBe('Main')
    expect(lastValue.content).toBe(0)
  })

  it('should call beforeInit hook after initialize a module', () => {
    expect(beforeInitCalled).toBe(true)
  })

  it('should call init hook when initialize a module', () => {
    expect(initialized).toBe(true)
  })

  it('should clone the state when merge a component if is an object', () => {
    let root: Component<any> = {
      name,
      state: {},
      inputs,
      actions,
      interfaces: {
        value: childValue,
      },
    }
    let app = run({
      root,
      interfaces: {
        value: emptyHandler,
      },
    })
    expect(app.ctx.components['Main'].state === root.state).toBeFalsy()
  })

  it('should work a component with no inputs', () => {
    let root: Component<any> = {
      name,
      state: {},
      interfaces: {
        value: childValue,
      },
    }
    let app = run({
      root,
      interfaces: {
        value: emptyHandler,
      },
    })
    expect(app).toBeDefined()
  })

  it('should log an error and notify error callback when module dont have an InterfaceHandler', () => {
    let lastLog
    run({
      root,
      interfaces: {},
      warn: (source, description) => lastLog = [source, description],
      error: (source, description) => lastLog = [source, description],
    })
    expect(lastLog).toEqual([
      'InterfaceHandlers',
      `'Main' component has no interface called 'value', missing interface handler`,
    ])
  })

  it('should log an error when call notifyInterfaceHandlers and one handler is missing', () => {
    let lastLog
    let app = run({
      root,
      interfaces: {},
      warn: (source, description) => lastLog = [source, description],
      error: (source, description) => lastLog = [source, description],
    })
    app.moduleAPI.merge('child', root)
    let space = app.ctx.components['Main$child']
    notifyInterfaceHandlers(space.ctx)
    expect(lastLog).toEqual([
      'notifyInterfaceHandlers',
      `module does not have interface handler named 'value' for component 'Main' from space 'Main$child'`,
    ])
  })

  // Inputs should dispatch actions and intefaces are recalculated

  let value

  it('should react to an input (dispatch function)', done => {
    valueFn = value => {
      expect(value.content).toBe(1)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({}, value.inc))
  })

  it('should dispatch an input with an extra as argument', done => {
    valueFn = value => {
      expect(value.content).toBe(10)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({}, value.set))
  })

  // fetch parameters for InputData

  it('should dispatch an input with a fetch parameter * as argument', done => {
    valueFn = value => {
      expect(value.content).toBe(24)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent(24, value.setFnAll))
  })

  it('should dispatch an input with a fetch parameter "value" as argument', done => {
    valueFn = value => {
      expect(value.content).toBe(35)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({ value: 35 }, value.setFnValue))
  })

  it('should dispatch an input with a function path string target.value as argument', done => {
    valueFn = value => {
      expect(value.content).toBe(37)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({ target: { value: 37 } }, value.setFnPath))
  })

  it('should dispatch an input with a fetch parameter "value" as argument and an extra argument', done => {
    valueFn = value => {
      expect(value.content).toBe(40)
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({ value: 35 }, value.setFnExtra))
  })

  it('should dispatch an input with a fetch parameter "value" as argument and an extra argument and value are an empty string', done => {
    valueFn = value => {
      expect(value.content).toBe('')
      done()
    }
    // extract value and dispatch interface handlers
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({ value: '' }, value.setFnGeneric))
  })

  it('should return the keys of the event info when dispatch an input with keys in the fetch parameter', done => {
    valueFn = value => {
      expect(value.content).toEqual({ a: 10, b: 'Fractal' })
      done()
    }
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({ value: 35, a: 10, b: 'Fractal' }, value.setFnKeys))
  })

  it('should return the keys of the path of event info when dispatch an input with path and keys in the fetch parameter', done => {
    valueFn = value => {
      expect(value.content).toEqual({ a: 10, b: 'Fractal', c: 17 })
      done()
    }
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({
      a: 0,
      p1: {
        z: 1,
        p2: {
          value: 35,
          a: 10,
          b: 'Fractal',
          c: 17,
          z: 'WWW',
        },
      },
    }, value.setFnPathKeys))
  })

  it('should return multiple paths if there are an array of arrays in the fetch parameter', done => {
    valueFn = value => {
      expect(value.content).toEqual([
        1,
        0,
        { a: 10, b: 'Fractal', c: 17 },
      ])
      done()
    }
    value = lastValue // this catch the scope variable
    value._dispatch(computeEvent({
      a: 0,
      p1: {
        z: 1,
        p2: {
          value: 35,
          a: 10,
          b: 'Fractal',
          c: 17,
          z: 'WWW',
        },
      },
    }, value.setFnPaths))
  })

  it('should put an entry in errorLog when error function is invoked', () => {
    let error = ['child', 'error 1']
    app.ctx.error(error[0], error[1])
    expect(lastLog).toEqual(error)
  })

  it('should execute onDispatch when dispatch an input', done => {
    let valueFn
    let lastValue
    function onValue(val) {
      lastValue = val
      if (valueFn) {
        valueFn(val)
      }
    }

    let app = run({
      root,
      interfaces: {
        value: valueHandler(onValue),
      },
      onDispatch: (ctx, ev) => {
        expect(ctx === app.ctx)
        expect(ev).toEqual(['Main', 'set', 10, undefined, 'context'])
        done()
      },
    })

    lastValue._dispatch(computeEvent({}, value.set))

  })

  it('should delegate warn function', () => {
    let warn = ['child', 'warn 1']
    app.ctx.warn(warn[0], warn[1])
    expect(lastLog).toEqual(warn)
  })

  it('should log an error when try to dispatch an input of an inexistent module', () => {
    value._dispatch(['Main$someId', 'someInput'])
    expect(lastLog).toEqual([
      'dispatch',
      `there are no component space 'Main$someId'`,
    ])
  })

  it('should log an error when try to dispatch an inexistent input of a module', () => {
    value._dispatch(['Main', 'someInput'])
    expect(lastLog).toEqual([
      'dispatch',
      `there are no input named 'someInput' in component 'Main' from space 'Main'`,
    ])
  })

  // Events should dispatch tasks to its handlers and those can dispatch events

  it('should dispatch an executable (action / task) asyncronusly from an event when it return a Task with EventData', done => {
    app.ctx.components['Main'].state = 1
    valueFn = value => {
      expect(value.content).toBe(2)
      expect(taskLog[taskLog.length - 1]).toEqual('info')
      done()
    }
    value._dispatch(value.task)
  })

  it('should log an error when try to dispatch an task that has no task handler', () => {
    valueFn = undefined
    value._dispatch(value.wrongTask)
    expect(lastLog).toEqual([
      'execute',
      `there are no task handler for 'wrongTask' in component 'Main' from space 'Main'`,
    ])
  })

  // Executable lists

  it('should dispatch an error if try to dispatch an executable list with a task with no handler', () => {
    valueFn = undefined
    value._dispatch(value.executableListWrong)
    expect(lastLog).toEqual([
      'execute',
      `there are no task handler for 'wrongTask2' in component 'Main' from space 'Main'`,
    ])
  })

  it('should dispatch an executable list that contains a task', done => {
    valueFn = value => {
      expect(value.content).toBe(3)
      expect(taskLog[taskLog.length - 1]).toEqual('info2')
      done()
    }
    value._dispatch(value.executableListTask)
  })

  it('should dispatch an executable list that contains an action', done => {
    valueFn = value => {
      expect(value.content).toBe(4)
      done()
    }
    value._dispatch(value.executableListAction)
  })

  // dispose module

  it('should dispose a module', () => {
    app.moduleAPI.dispose()
    expect(app.ctx.components).toEqual({})
  })

  it('should call destroy hook when dispose a module', () => {
    expect(disposed).toEqual(true)
  })

})

describe('Component composition', () => {

  // Managed composition

  // for building new components reutilize the existents

  let child: Component<any> = {
    name: 'Child',
    groups: {
      value: 'ChildValueGroup',
    },
    state,
    inputs,
    actions,
    interfaces: {
      value: childValue,
    },
  }

  let components = {
    child1: child,
    child2: child,
    child3: child,
  }

  let mainValue: ValueInterface<any> =
    (ctx, s) => ({
      tagName: s.key,
      content: s,
      inc: ev(ctx, 'inc'),
      childValue1: interfaceOf(ctx, 'child1', 'value'),
      childValue2: interfaceOf(ctx, 'child2', 'value'),
      childValue3: interfaceOf(ctx, 'child3', 'value'),
    })

  let main: Component<any> = {
    name: 'Main',
    groups: {
      value: 'MainValueGroup',
    },
    state,
    components,
    inputs,
    actions,
    interfaces: {
      value: mainValue,
    },
  }

  let app: Module

  let valueFn
  let lastValue
  function onValue(val) {
    lastValue = val
    if (valueFn) {
      valueFn(val)
    }
  }
  let lastGroup
  let groupLog = []
  let groupHandler: Handler = () => mod => ({
    state: undefined,
    handle: ([id, group]) => {
      lastGroup = group
      groupLog.push(group)
      mod.setGroup(id, 'value', group + 'F1')
    },
    dispose: () => 0,
  })

  it('should merge child components', () => {
    app = run({
      root: main,
      groups: {
        value: groupHandler(),
      },
      interfaces: {
        value: valueHandler(onValue),
      }
    })
    expect(app.ctx.components['Main$child1']).toBeDefined()
    expect(app.ctx.components['Main$child2']).toBeDefined()
    expect(app.ctx.components['Main$child3']).toBeDefined()
  })

  it('should handle groups', () => {
    expect(groupLog).toEqual(['ChildValueGroup', 'ChildValueGroup', 'ChildValueGroup', 'MainValueGroup'])
  })

  it('should merge groups', () => {
    expect(app.ctx.components['Main'].ctx.groups['value']).toEqual('MainValueGroupF1')
    expect(app.ctx.components['Main$child1'].ctx.groups['value']).toEqual('ChildValueGroupF1')
    expect(app.ctx.components['Main$child2'].ctx.groups['value']).toEqual('ChildValueGroupF1')
    expect(app.ctx.components['Main$child3'].ctx.groups['value']).toEqual('ChildValueGroupF1')
  })

  it('should log an error when module does not have group handler for a certain group from a component', () => {
    let log
    run({
      root: main,
      groups: {
        wrong: groupHandler(),
      },
      interfaces: {
        value: emptyHandler,
      },
      error: (source, description) => log = [source, description],
    })
    expect(log).toEqual([
      'merge',
      `module has no group handler for 'value' of component 'Main' from space 'Main'`
    ])
  })

  it('a child should react to events', done => {
    let value = lastValue
    valueFn = value => {
      expect(value.childValue1.content).toBe(1)
      expect(value.childValue2.content).toBe(0)
      expect(value.childValue3.content).toBe(0)
      done()
    }
    value._dispatch(value.childValue1.inc)
  })

  it('a child should dispatch his own inputs', done => {
    let value = lastValue
    valueFn = value => {
      expect(value.childValue1.content).toBe(2)
      done()
    }
    value._dispatch(value.childValue1.dispatch)
  })

  it('parent should react to child events when have an global input called $$_childInputName', done => {
    let value = lastValue
    valueFn = value => {
      expect(value.content).toBe(21)
      done()
    }
    value._dispatch(value.childValue1.toParentGlobal)
  })

  it('parent should react to child events when have an input called $childName_childInputName', done => {
    let value = lastValue
    valueFn = value => {
      expect(value.content).toBe(17)
      done()
    }
    value._dispatch(value.childValue1.toParent)
  })

  it('should unmerge a component tree', () => {
    unmerge(app.ctx)
    expect(Object.keys(app.ctx.components).length).toEqual(0)
  })

  it('should log an error when unmerge an inexistent component', () => {
    let lastLog
    app = run({
      root: main,
      groups: {
        value: emptyHandler,
      },
      interfaces: {
        value: valueHandler(() => 0),
      },
      error: (source, description) => lastLog = [source, description],
    })
    unmerge(app.ctx, 'wrong')
    expect(lastLog).toEqual([
      'unmerge',
      `there is no component with name 'wrong' at component 'Main'`,
    ])
  })

  // module API

  it('module API merge should merge a component', () => {
    app = run({
      root: main,
      groups: {
        value: emptyHandler,
      },
      interfaces: {
        value: valueHandler(() => 0),
      },
    })
    app.moduleAPI.merge('mainChild', main)
    expect(app.ctx.components['Main$mainChild']).toBeDefined()
    expect(app.ctx.components['Main$mainChild$child1']).toBeDefined()
    expect(app.ctx.components['Main$mainChild$child2']).toBeDefined()
    expect(app.ctx.components['Main$mainChild$child3']).toBeDefined()
  })

  it('module API mergeAll should merge many components', () => {
    app.moduleAPI.mergeAll({
      fancyChild1: child,
      fancyChild2: child,
      fancyChild3: child,
    })
    expect(app.ctx.components['Main$fancyChild1']).toBeDefined()
    expect(app.ctx.components['Main$fancyChild2']).toBeDefined()
    expect(app.ctx.components['Main$fancyChild3']).toBeDefined()
  })

  it('module API unmerge should unmerge a component tree', () => {
    app.moduleAPI.unmerge('mainChild')
    expect(app.ctx.components['Main$mainChild']).toBeUndefined()
    expect(app.ctx.components['Main$mainChild$child1']).toBeUndefined()
    expect(app.ctx.components['Main$mainChild$child2']).toBeUndefined()
    expect(app.ctx.components['Main$mainChild$child3']).toBeUndefined()
  })

  it('module API unmergeAll should unmerge many components', () => {
    app.moduleAPI.mergeAll({
      fancyChild1: child,
      fancyChild2: child,
      fancyChild3: child,
    })
    app.moduleAPI.unmergeAll([
      'fancyChild1',
      'fancyChild2',
      'fancyChild3',
    ])
    expect(app.ctx.components['Main$fancyChild1']).toBeUndefined()
    expect(app.ctx.components['Main$fancyChild2']).toBeUndefined()
    expect(app.ctx.components['Main$fancyChild3']).toBeUndefined()
  })

})

describe('Lifecycle hooks', () => {
  let disposeLog = []

  let init = ctx => {
    dispatch(ctx, ev(ctx, 'inc'))
  }
  let destroy = ctx => {
    let parts = ctx.id.split('$')
    disposeLog.push(parts[parts.length - 1])
  }

  let child: Component<any> = {
    name: 'Child',
    state,
    init,
    destroy,
    inputs,
    actions,
    interfaces: {
      value: childValue,
    },
  }
  let components = {
    child1: child,
    child2: child,
    child3: child,
  }
  let mainValue: ValueInterface<any> =
    (ctx, s) => ({
      tagName: s.key,
      content: s,
      inc: ev(ctx, 'inc'),
      childValue1: interfaceOf(ctx, 'child1', 'value'),
      childValue2: interfaceOf(ctx, 'child2', 'value'),
      childValue3: interfaceOf(ctx, 'child3', 'value'),
    })

  let main: Component<any> = {
    name: 'Main',
    state,
    init,
    destroy,
    components,
    inputs,
    actions,
    interfaces: {
      value: mainValue,
    },
  }

  let app: Module

  let valueFn
  let lastValue
  function onValue(val) {
    lastValue = val
    if (valueFn) {
      valueFn(val)
    }
  }

  let value

  it('should call init in all component tree when initialize the module', () => {
    app = run({
      root: main,
      interfaces: {
        value: valueHandler(onValue),
      },
    })
    value = lastValue
    expect(value.childValue1.content).toBe(1)
    expect(value.childValue2.content).toBe(1)
    expect(value.childValue3.content).toBe(1)
  })

  it('should call destroy in all component tree when dispose the module', () => {
    app.moduleAPI.dispose()
    expect(disposeLog).toEqual(['child1', 'child2', 'child3', 'Main'])
  })

})

describe('Hot swapping', () => {

  let child: Component<any> = {
    name: 'Child',
    state,
    inputs,
    actions,
    interfaces: {
      value: childValue,
    },
  }
  let components = {
    child1: child,
    child2: child,
    child3: child,
  }
  let actions2 = {
    Inc: () => s => {
      s.count++
      return s
    },
  }
  let inputs2 = (ctx: Context) => ({
    inc: () => actions2.Inc(),
  })
  let mainValueV1: ValueInterface<any> =
    (ctx, s) => ({
      tagName: ctx.name,
      content: s.count,
      content2: s.count2,
      inc: ev(ctx, 'inc'),
      childValue1: interfaceOf(ctx, 'child1', 'value'),
      childValue2: interfaceOf(ctx, 'child2', 'value'),
      childValue3: interfaceOf(ctx, 'child3', 'value'),
    })

  let mainV1: Component<any> = {
    name: 'Main',
    state: {
      count: 0,
      count2: 12,
    },
    components,
    actions: actions2,
    inputs: inputs2,
    interfaces: {
      value: mainValueV1,
    },
  }

  let mainValueV2: ValueInterface<any> =
    (ctx, s) => ({
      tagName: ctx.name,
      content: 'Fractal is awesome V2!! ' + s.count + ' :D',
      content2: 'Fractal is awesome V2!! ' + s.count2 + ' :D',
      inc: ev(ctx, 'inc'),
      childValue1: interfaceOf(ctx, 'child1', 'value'),
      childValue2: interfaceOf(ctx, 'child2', 'value'),
      childValue3: interfaceOf(ctx, 'child3', 'value'),
    })

  let mainV2: Component<any> = {
    name: 'Main',
    state: {
      count: 0,
      count2: 125,
    },
    components,
    actions: actions2,
    inputs: inputs2,
    interfaces: {
      value: mainValueV2,
    },
  }

  let app: Module

  let valueFn
  let lastValue
  function onValue(val) {
    lastValue = val
    if (valueFn) {
      valueFn(val)
    }
  }

  let value

  it('should reattach root component', () => {
    app = run({
      root: mainV1,
      interfaces: {
        value: valueHandler(onValue),
      },
    })
    app.moduleAPI.reattach(mainV2)
    value = lastValue
    expect(value.content).toBe('Fractal is awesome V2!! 0 :D')
    expect(value.childValue1.content).toBe(0)
    expect(value.childValue2.content).toBe(0)
    expect(value.childValue3.content).toBe(0)
  })

  it('should reattach root component merging the states using ', () => {
    app = run({
      root: mainV1,
      interfaces: {
        value: valueHandler(onValue),
      },
    })
    value = lastValue
    value._dispatch(value.inc)
    value = lastValue
    expect(value.content).toBe(1)
    expect(value.content2).toBe(12)
    app.moduleAPI.reattach(mainV2, mergeStates)
    value = lastValue
    expect(value.content).toBe('Fractal is awesome V2!! 1 :D')
    expect(value.content2).toBe('Fractal is awesome V2!! 125 :D')
  })

})

describe('Clone function helper', () => {

  let obj2 = {
    a: 9,
    b: [],
  }
  let obj = {
    c: {
      obj2,
    },
  }
  let obj3 = clone(obj)

  it('should deep clone an object', () => {
    obj3.c.obj2.a = 3
    expect(obj3.c.obj2.a === obj2.a).toBeFalsy()
    expect(obj3.c.obj2.b === obj2.b).toBeFalsy()
  })

})
