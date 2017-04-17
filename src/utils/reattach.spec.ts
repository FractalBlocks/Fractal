import { Context, ComponentSpaceIndex } from '../core'
import { mergeStates } from './reattach'

describe('mergeStates function should merge the states of the lastComponents and the context', () => {

  let ctx: Context = {
    id: '',
    name,
    groups: {},
    components: {},
    groupHandlers: {},
    interfaceHandlers: {},
    taskHandlers: {},
    warn: () => 0,
    error: () => 0,
  }

  function createCompIndex (state, defState, name = 'Main', defs = {}, isStatic = true): ComponentSpaceIndex {
    return {
      [name]: {
        ctx,
        isStatic,
        state,
        inputs: {},
        components: {},
        // component index for dynamic handling (new and dispose)
        def: {
          name,
          defs,
          state: defState,
          inputs: ctx => ({}),
          actions: {},
          interfaces: {},
        },
      },
    }
  }

  it('should merge objects', () => {
    let state = { a: 0, b: 0 }
    let modifiedState = { a: 1, b: 3 }
    let newState = { a: 10, b: 0 }
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.Main.state).toEqual({ a: 10, b: 3 })
  })

  it('should replace values if initial state changed', () => {
    let state = 0
    let modifiedState = 2
    let newState = 3
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.Main.state).toEqual(3)
  })

  it('should replace values if initial state changed and states are objects', () => {
    let state = {}
    let modifiedState = { a: 1 }
    let newState = {}
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.Main.state).toEqual({ a: 1 })
  })

  it('should leave values if initial state is unchanged', () => {
    let state = 0
    let modifiedState = 2
    let newState = 0
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.Main.state).toEqual(2)
  })

  it('should merge new component states unchanged', () => {
    let state = 0
    let modifiedState = 2
    let newState = 0
    let components = createCompIndex(newState, state)
    let componentsAux = createCompIndex(123, 123)
    components.New = componentsAux.Main
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.New.state).toEqual(123)
  })

  it('should merge values if initial state changed, states are complex objects', () => {
    let state = {
      list: {},
      count: 0,
    }
    let modifiedState = {
      list: {
        1: 'a',
        2: 'b',
      },
      count: 2,
    }
    let newState = {
      list: {},
      count: 0,
    }
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(<any> {}, components, lastComponents)
    expect(result.Main.state).toEqual({
      list: {
        1: 'a',
        2: 'b',
      },
      count: 2,
    })
  })

  it('should merge states both last and new components', () => {
    let state = {
      list: {},
      count: 0,
    }
    let modifiedState = {
      list: {
        1: 'a',
        2: 'b',
      },
      count: 2,
    }
    let newState = {
      list: {},
      count: 0,
    }
    let dynamic = createCompIndex(state, state, 'Main$other', {}, false)
    let components = createCompIndex(newState, state, 'Main', { 'Main$other': dynamic['Main$other'].def })
    let lastComponents = {
      ...createCompIndex(modifiedState, state, 'Main'),
      ...dynamic, // dynamic component
    }
    let result = mergeStates(<any> {}, components, lastComponents)
    // normal behavior
    expect(result.Main.state).toEqual({
      list: {
        1: 'a',
        2: 'b',
      },
      count: 2,
    })
    // expect to have last components
    expect(result['Main$other'].state).toEqual({
      list: {},
      count: 0,
    })
  })

  it('should dispatch an error when component defs of a parent does not have definition of a dynamic component', done => {
    let state = {
      list: {},
      count: 0,
    }
    let modifiedState = {
      list: {
        1: 'a',
        2: 'b',
      },
      count: 2,
    }
    let newState = {
      list: {},
      count: 0,
    }
    let dynamic = createCompIndex(state, state, 'Main$other', {}, false)
    let components = createCompIndex(newState, state, 'Main', {})
    let lastComponents = {
      ...createCompIndex(modifiedState, state, 'Main'),
      ...dynamic, // dynamic component
    }
    let error = (source, description) => {
      expect(source).toEqual('mergeStates')
      expect(description).toEqual('there are no dynamic component definition of Main$other (defs) in Main')
      done()
    }
    mergeStates(<any> { error }, components, lastComponents)
  })

})
