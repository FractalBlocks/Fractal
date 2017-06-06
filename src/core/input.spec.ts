import { stateOf, toChild, toAct } from './input'
import { run } from './module'
import { Component } from './core'

describe('Input functions and helpers', () => {

  describe('stateOf helper', () => {

    let lastError
    let ctx = {
      id: 'id1',
      components: {
        id1: {
          state: {},
        },
        id1$child: {
          state: {},
        },
      },
      error: (source, description) => lastError = [source, description],
    }
    let ctx2 = {
      ...ctx,
      id: 'wrong',
    }

    it('should return the component state from her context', () => {
      expect(stateOf(<any> ctx)()).toBe(ctx.components[ctx.id].state)
    })

    it('should get the state from a certain component', () => {
      let state = stateOf(<any> ctx)('child')
      expect(state).toEqual(ctx.components['id1$child'].state)
    })

    it('should log an error if there are no ctx space', () => {
      stateOf(<any> ctx2)()
      expect(lastError).toEqual(['stateOf', `there are no space 'wrong'`])
    })

    it('should log an error if there are no child space', () => {
      stateOf(<any> ctx)('wrongChild')
      expect(lastError).toEqual(['stateOf', `there are no child 'wrongChild' in space 'id1'`])
    })

  })

  describe('toChild function', () => {
    let childData
    let Child: Component<any> = {
      name: 'Child',
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({
        childInput: data => {
          childData = data
        },
      }),
      actions: {},
      interfaces: {},
    }
    let root: Component<any> = {
      name: 'Root',
      components: {
        Child,
      },
      state: {},
      inputs: ctx => ({}),
      actions: {},
      interfaces: {},
    }
    let error
    let app = run({
      root,
      interfaces: {},
      error: (source, description) => error = [source, description],
    })

    it ('should send a message to a child component from the parent correctly', () => {
      let data = 129
      toChild(app.ctx.components['Root'].ctx)('Child', 'childInput', data)
      expect(childData).toEqual(data)
    })

    it ('should send an undefined message to a child component from the parent correctly', () => {
      toChild(app.ctx.components['Root'].ctx)('Child', 'childInput')
      expect(childData).toEqual(undefined)
    })

    it ('should log an error when there is no child', () => {
      toChild(app.ctx.components['Root'].ctx)('Wrong', 'childInput')
      expect(error).toEqual(['toChild', `there are no child 'Wrong' in space 'Root'`])
    })

  })


  describe('Generic action self caller', () => {
    let actionData = []
    let root: Component<any> = {
      name: 'MyComp',
      state: 0,
      inputs: ctx => ({
        action: ([name, data]) => {
          actionData = [name, data]
        },
      }),
      actions: {
        Inc: s => s + 1,
      },
      interfaces: {},
    }
    let app = run({
      root,
      interfaces: {},
    })

    it('should call input with the action name and data', () => {
      toAct(app.ctx.components.MyComp.ctx)('Name', 'data1')
      expect(actionData).toEqual(['Name', 'data1'])
      toAct(app.ctx.components.MyComp.ctx)('Name', 'data2', false, true)
      expect(actionData).toEqual(['Name', 'data2'])
    })

  })

})
