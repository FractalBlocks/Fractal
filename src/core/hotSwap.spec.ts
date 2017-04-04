import { Module, Component, run, merge } from './index'
import { valueHandler } from '../interfaces/value'
import { mergeStates } from '../utils/reattach'

describe('Hot swaping functionality', () => {

  function setup (root: Component, interfaceCb, groupCb?, logCb?): Module {
    return run({
      root,
      groups: {
        value: valueHandler(groupCb)
      },
      interfaces: {
        value: valueHandler(interfaceCb)
      },
      warn: logCb,
      error: logCb,
    })
  }

  let SubChild: Component = {
    name: 'SubChild',
    groups: {
      value: 'subchild',
    },
    interfaces: {
      value: (ctx, s) => ({ value: '21' }),
    },
  }

  let Child: Component = {
    name: 'Child',
    defs: {
      SubChild,
    },
    components: {
      subChild: SubChild,
    },
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

  let SubChildV2: Component = {
    name: 'SubChild',
    groups: {
      value: 'subchildV2',
    },
    interfaces: {
      value: (ctx, s) => ({ value: '21' }),
    },
  }

  let ChildV2: Component = {
    name: 'Child',
    defs: {
      SubChild: SubChildV2,
    },
    components: {
      subChild: SubChildV2,
    },
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

    merge(app.ctx, '0', Child)

    app.moduleAPI.reattach(CompV2, mergeStates)
  })

  it('should dispatch an error when dynamic component dont references (refs) child components', done => {
    let Child: Component = {
      name: 'Child',
      components: {
        subChild: SubChild,
      },
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
    let app = setup(Comp, () => 0, () => 0, (source, description) => {
      expect([source, description]).toEqual([
        'mergeStates',
        'there are no dynamic component definition of SubChild (defs) in Main$0'
      ])
      done()
    })

    merge(app.ctx, '0', Child)

    let ChildV2: Component = {
      name: 'Child',
      components: {
        subChild: SubChildV2,
      },
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
    app.moduleAPI.reattach(CompV2, mergeStates)
  })

})
