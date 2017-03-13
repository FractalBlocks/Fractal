import { Context, Component, ComponentSpaceIndex } from '../src'
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

  function createCompIndex (state, defState): ComponentSpaceIndex {
    return {
      Main: {
        ctx,
        state,
        inputs: {},
        // component index for dynamic handling (new and dispose)
        components: {},
        def: {
          name: 'Main',
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
    let result = mergeStates(components, lastComponents)
    expect(result.Main.state).toEqual({ a: 10, b: 3 })
  })

  it('should replace values if initial state changed', () => {
    let state = 0
    let modifiedState = 2
    let newState = 3
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(components, lastComponents)
    expect(result.Main.state).toEqual(3)
  })

  it('should leave values if initial state is unchanged', () => {
    let state = 0
    let modifiedState = 2
    let newState = 0
    let components = createCompIndex(newState, state)
    let lastComponents = createCompIndex(modifiedState, state)
    let result = mergeStates(components, lastComponents)
    expect(result.Main.state).toEqual(3)
  })

})
