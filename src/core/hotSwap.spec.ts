import { Module, Component, run, merge } from './index'
import { valueHandler } from '../interfaces/value'
import { mergeStates } from '../utils/reattach'

describe('Hot swaping functionality', () => {

  function setup (root: Component, interfaceCb, groupCb): Module {
    return run({
      root,
      groups: {
        value: valueHandler(groupCb)
      },
      interfaces: {
        value: valueHandler(interfaceCb)
      },
    })

  }

  let Child: Component = {
    name: 'Child',
    groups: {
      value: 'child',
    },
    interfaces: {
      value: (ctx, s) => ({ value: '17' }),
    },
  }

  let Comp: Component = {
    name: 'Main',
    defs: {
      Child,
    },
    components: {
      b1: Child,
    },
    groups: {
      value: 'main',
    },
    interfaces: {
      value: (ctx, s) => ({ value: '12345' }),
    },
  }

  it('should merge components', done => {
    let count = 0
    let app = setup(Comp, () => 0, group => {
      if (group[1] === 'childV2') {
        if (count === 1) {
          expect(group[0]).toEqual('Main$0')
          done()
        } else {
          count++
        }
      }
    })

    let ChildV2: Component = {
      name: 'Child',
      groups: {
        value: 'childV2',
      },
      interfaces: {
        value: (ctx, s) => ({ value: 'V2' }),
      },
    }

    let CompV2: Component = {
      name: 'Main',
      defs: {
        Child: ChildV2,
      },
      components: {
        b1: ChildV2,
      },
      groups: {
        value: 'V2',
      },
      interfaces: {
        value: (ctx, s) => ({ value: 'V2' }),
      },
    }

    merge(app.ctx, '0', Child)

    app.moduleAPI.reattach(CompV2, mergeStates)
  })

})
