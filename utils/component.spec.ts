import { Component, run, interfaceOf } from '../src'
import { action, props, vw, parent } from './component'

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

  })

  describe('Props function for making a new component', () => {

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
      let newComp = props(comp, { count: 4 })
      expect(newComp).toBeDefined()
      expect(newComp.state['data']).toEqual(10)
      expect(newComp.state['count']).toEqual(4)
    })

    it('should make a new component when passing a value by replacing the state', () => {
      let newComp = props(comp, 5)
      expect(newComp).toBeDefined()
      expect(newComp.state).toEqual(5)
    })

  })

  describe('Syntax sugar for components', () => {
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
    let module = run({
      root: comp,
      interfaces: {},
    })

    it ('should be the same to use vw and interfaceOf functions', () => {
      let interfaceObj = vw(module.ctx.components['MyComp'].ctx, 'child')
      expect(interfaceObj).toEqual(interfaceOf(module.ctx.components['MyComp'].ctx, 'child', 'view'))
    })

    describe('parent function', () => {

      it ('should be obtain the parent of a context', () => {
        let parentCtx = parent(module.ctx.components['MyComp$child'].ctx)
        expect(parentCtx).toEqual(module.ctx)
      })

      it ('should return the same context if is the root context', () => {
        expect(parent(module.ctx)).toEqual(module.ctx)
      })

    })


  })

})
