import { Component } from './core'
import { createContext, run, nest } from './module'
import { _ev, _act, _interfaceOf, makeInterfaceHelpers, _vw } from './interface'
import { ValueInterface } from '../interfaces/value'

describe('Interface functions and helpers', () => {

  describe('interfaceOf function', () => {

    let lastLog

    let rootCtx: any = {
      id: 'Main',
      name: 'Main',
      groups: {},
      global: {
        initialized: false,
      },
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
    rootCtx.rootCtx = rootCtx

    let childValue: ValueInterface<any> =
      ({ ctx }) => s => ({
        tagName: ctx.id,
        content: s,
      })

    let root: Component<any> = {
      name: 'Child',
      state: 0,
      inputs: () => ({}),
      actions: {},
      interfaces: {
        value: childValue,
      },
    }

    nest(rootCtx)('Child', root)


    it('should get an interface message from a certain component (interfaceOf)', () => {
      let state = rootCtx.components[rootCtx.id + '$Child'].state
      expect(_interfaceOf(rootCtx)('Child', 'value'))
        .toEqual(
          childValue(
            makeInterfaceHelpers(createContext(rootCtx, 'Child'))
          )(state)
        )
    })

    it('should log an error if try to get an interface message from an inexistent component (interfaceOf)', () => {
      _interfaceOf(rootCtx)('Wrong', 'value')
      expect(lastLog).toEqual([
        'interfaceOf',
        `there are no component space 'Main$Wrong'`,
      ])
    })

    it('should log an error if try to get an inexistent interface message from a certain component (interfaceOf)', () => {
      _interfaceOf(rootCtx)('Child', 'wrong')
      expect(lastLog).toEqual([
        'interfaceOf',
        `there are no interface 'wrong' in component 'Child' from space 'Main$Child'`,
      ])
    })

  })

  describe('act function sugar for generic inputs', () => {
    let ctx = {}
    it('should return the same as ev without the input name', () => {
      expect(_act(<any> ctx)('actionName', 's', 'value')).toEqual(_ev(<any> ctx)('action', ['actionName', 's'], 'value'))
    })

  })

    describe('vw function sugar for components', () => {
    let child: Component<any> = {
      name: 'Child',
      state: {
        count: 0,
        data: 10,
      },
      inputs: ctx => ({}),
      actions: {},
      interfaces: {},
    }
    let comp: Component<any> = {
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
      interfaces: {},
    }
    let app = run({
      root: comp,
      interfaces: {},
    })

    it ('should be the same to use vw and interfaceOf functions', () => {
      let interfaceObj = _vw(app.ctx)('child')
      expect(interfaceObj).toEqual(_interfaceOf(app.ctx.components['MyComp'].ctx)('child', 'view'))
    })

  })

})
