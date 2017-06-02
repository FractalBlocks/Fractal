import { Component, run, clone } from './core'
import {
  action,
  props,
  setGroup,
  spaceOf,
  sendMsg,
  toChild,
  toAct,
} from './component'

describe('Component helpers', () => {

  describe('Generic action input', () => {

    let actions = {
      a1: x => x,
    }
    let actionFn = action(actions)

    it('should accept an action name and a value as an array, in the case of a function string', () => {
      expect(actionFn(['a1', 'someValue'])).toEqual('someValue')
    })

    it('should accept an action-value pair as first argument of an array and a value in the second', () => {
      expect(actionFn([['a1', 10]])).toEqual(10)
    })

    it('should accept an action-contextValue pair as first argument and a fetch value in the second', () => {
      expect(actionFn([['a1', 10], 7])).toEqual([10, 7])
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
      toAct(app.ctx.components.MyComp.ctx, 'Name', 'data1')
      expect(actionData).toEqual(['Name', 'data1'])
      toAct(app.ctx.components.MyComp.ctx, 'Name', 'data2', true)
      expect(actionData).toEqual(['Name', 'data2'])
    })

  })

  describe('props function for making a new component by modifying the state', () => {

    let comp: Component<any> = {
      name: 'MyComp',
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({}),
      actions: {},
      interfaces: {},
    }

    it('should make a new component when passing an object by merging with default state', () => {
      let newComp = props({ count: 4 })(clone(comp))
      expect(newComp).toBeDefined()
      expect(newComp.state['data']).toEqual(10)
      expect(newComp.state['count']).toEqual(4)
    })

    it('should make a new component when passing a value by replacing the state', () => {
      let newComp = props(5)(clone(comp))
      expect(newComp).toBeDefined()
      expect(newComp.state).toEqual(5)
    })

  })

  describe('setGroup function for setting a component group', () => {

    let comp: Component<any> = {
      name: 'MyComp',
      groups: {
        style: {
          base: {
            a: 1,
            b: 1,
          },
        },
      },
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({}),
      actions: {},
      interfaces: {},
    }

    it('should set a group of a component', () => {
      let newComp = setGroup('style', { base: { x: 2 } })(clone(comp))
      expect(newComp.groups.style.base.a).toBeUndefined()
      expect(newComp.groups.style.base.x).toEqual(2)
    })

  })

  describe('message interchange between components', () => {
    let childData
    let parentData
    let parentDataUnique
    let selfData
    let app

    beforeEach(() => {
      childData = undefined
      parentData = undefined
      parentDataUnique = undefined
      selfData = undefined

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
        state: {
          count: 0,
          data: 10,
        },
        inputs: ctx => ({
          selfMessage: data => {
            selfData = data
          },
          $Child_inputName: data => {
            parentData = data
          },
          $$Child_remove: data => {
            parentDataUnique = data
          },
        }),
        actions: {},
        interfaces: {},
      }
      app = run({
        root,
        interfaces: {},
      })
    })

    it ('sendMsg should send a message to a component from outside the module correctly', () => {
      let data = 119
      sendMsg(app, 'MyComp$Child', 'childInput', data)
      expect(childData).toEqual(data)
    })

    it ('toChild should send a message to a child component from the parent correctly', () => {
      let data = 129
      toChild(app.ctx.components['MyComp'].ctx, 'Child', 'childInput', data, true)
      expect(childData).toEqual(data)
    })

    it ('toChild should send an undefined message to a child component from the parent correctly', () => {
      toChild(app.ctx.components['MyComp'].ctx, 'Child', 'childInput')
      expect(childData).toEqual(undefined)
    })

  })

  describe('spaceOf helper', () => {
    let ctx = {
      id: 'id1',
      components: {
        id1: {
          state: {},
        },
      },
    }
    it('should return the component state from her context', () => {
      expect(spaceOf(<any> ctx)).toBe(ctx.components[ctx.id])
    })

  })

})
