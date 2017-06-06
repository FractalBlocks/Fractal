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

  describe('Message interchange between components', () => {
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
      name: 'MyComp',
      components: {
        Child,
      },
      state: {},
      inputs: ctx => ({}),
      actions: {},
      interfaces: {},
    }
    let app = run({
      root,
      interfaces: {},
    })

    it ('toChild should send a message to a child component from the parent correctly', () => {
      let data = 129
      toChild(app.ctx.components['MyComp'].ctx)('Child', 'childInput', data)
      expect(childData).toEqual(data)
    })

    it ('toChild should send an undefined message to a child component from the parent correctly', () => {
      toChild(app.ctx.components['MyComp'].ctx)('Child', 'childInput')
      expect(childData).toEqual(undefined)
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
      toAct(app.ctx.components.MyComp.ctx)('Name', 'data2', true)
      expect(actionData).toEqual(['Name', 'data2'])
    })

  })

})
