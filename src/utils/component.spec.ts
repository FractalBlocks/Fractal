import { Component, run, interfaceOf, clone, ev } from '../core'
import {
  action,
  props,
  vw,
  pipe,
  setGroup,
  mapToObj,
  act,
  stateOf,
  spaceOf,
  sendMsg,
  toChild,
  toParent,
} from './component'

describe('Component helpers', () => {

  describe('Generic input', () => {

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

  describe('act function sugar for generic inputs', () => {
    let ctx = {}
    it('should return the same as ev without the input name', () => {
      expect(act(<any> ctx, 's', 'value')).toEqual(ev(<any> ctx, 'action', 's', 'value'))
    })
  })

  describe('pipe function for piping functions', () => {
    let fun = pipe(
      x => x + 1,
      x => x + 1,
      x => x - 1,
      x => x * 2,
    )

    it('should return the rigth result', () => {
      expect(fun(0)).toBe(2)
      expect(fun(1)).toBe(4)
      expect(fun(2)).toBe(6)
      expect(fun(3)).toBe(8)
    })

  })

  describe('props function for making a new component by modifying the state', () => {

    let comp: Component = {
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

    let comp: Component = {
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

  describe('vw function sugar for components', () => {
    let child: Component = {
      name: 'Child',
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({}),
      actions: {},
      interfaces: {
        i1: () => 112,
      },
    }
    let comp: Component = {
      name: 'MyComp',
      components: {
        child,
      },
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({}),
      actions: {},
      interfaces: {
        i1: () => 112,
      },
    }
    let app = run({
      root: comp,
      interfaces: {},
    })

    it ('should be the same to use vw and interfaceOf functions', () => {
      let interfaceObj = vw(app.ctx.components['MyComp'].ctx, 'child')
      expect(interfaceObj).toEqual(interfaceOf(app.ctx.components['MyComp'].ctx, 'child', 'view'))
    })

  })

  describe('send messages to an input of a component from its parent and from outside the module', () => {
    let childData
    let parentData
    let parentDataUnique
    let lastError
    let app

    beforeEach(() => {
      childData = undefined
      parentData = undefined
      parentDataUnique = undefined
      lastError = undefined

      let Child: Component = {
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
        interfaces: {
          i1: () => 112,
        },
      }
      let comp: Component = {
        name: 'MyComp',
        components: {
          child: Child,
        },
        state: {
          count: 0,
          data: 10,
        },
        inputs: ctx => ({
          $child_inputName: data => {
            parentData = data
          },
          $$Child_remove: data => {
            parentDataUnique = data
          },
        }),
        actions: {},
        interfaces: {
          i1: () => 112,
        },
      }
      app = run({
        root: comp,
        interfaces: {},
        error: (source, description) => lastError = [source, description],
      })
    })

    it ('should send a message to a component from outside the module correctly', () => {
      let data = 119
      sendMsg(app, 'MyComp$child', 'childInput', data)
      expect(childData).toEqual(data)
    })

    it ('should send a message to a child component from the parent correctly', () => {
      let data = 129
      toChild(app.ctx.components['MyComp'].ctx, 'child', 'childInput', data)
      expect(childData).toEqual(data)
    })

    it ('should send a message the parent component from a child component', () => {
      let data = 121
      toParent(app.ctx.components['MyComp$child'].ctx, 'inputName', data)
      expect(parentData).toEqual(data)
    })

    it ('should send a message to the parent component from a child component in a unique way', () => {
      let data = 127
      toParent(app.ctx.components['MyComp$child'].ctx, 'remove', data, true)
      expect(parentDataUnique).toEqual(['child', data])
    })

    it ('should not send a message to the parent component from a child component if child is root component', () => {
      let data = 131
      toParent(app.ctx.components['MyComp'].ctx, 'inputName', data)
      expect(parentDataUnique).toEqual(undefined)
    })

    it ('should log an error if there are no input in parent', () => {
      let data = 331
      toParent(app.ctx.components['MyComp$child'].ctx, 'inputNameWrong', data)
      expect(lastError).toEqual([
        'toParent',
        `there are no '$child_inputNameWrong' input in parent 'MyComp' as expected by 'MyComp$child'`
      ])
    })

  })

  describe('mapToObj helper', () => {

    it('should map an array to an object', () => {
      expect(mapToObj([1, 2, 3], (idx, value) => ['a' + idx, `a${value}elm`])).toEqual({
        a0: 'a1elm',
        a1: 'a2elm',
        a2: 'a3elm',
      })
    })

  })

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
      expect(stateOf(<any> ctx)).toBe(ctx.components[ctx.id].state)
    })

    it('should get the state from a certain component', () => {
      let state = stateOf(<any> ctx , 'child')
      expect(state).toEqual(ctx.components['id1$child'].state)
    })

    it('should log an error if there are no ctx space', () => {
      stateOf(<any> ctx2)
      expect(lastError).toEqual(['stateOf', `there are no space 'wrong'`])
    })

    it('should log an error if there are no child space', () => {
      stateOf(<any> ctx, 'wrongChild')
      expect(lastError).toEqual(['stateOf', `there are no child 'wrongChild' in space 'id1'`])
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
