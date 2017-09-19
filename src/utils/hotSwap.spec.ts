import { Module, Component, run, nest } from '../core'
import { valueHandler } from '../interfaces/value'
import { mergeStates } from './reattach'

describe('Hot swaping functionality', () => {

  function setup (root: Component<any>, interfaceCb, groupCb?, logCb?): Promise<Module> {
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

  let SubChild: Component<any> = {
    name: 'SubChild',
    groups: {
      value: 'subchild',
    },
    interfaces: {
      value: () => s => ({ value: '21' }),
    },
  }

  let Child: Component<any> = {
    name: 'Child',
    components: {
      subChild: SubChild,
    },
    groups: {
      value: 'child',
    },
    interfaces: {
      value: () => s => ({ value: '17' }),
    },
  }

  let Comp: Component<any> = {
    name: 'Main',
    components: {
      b1: Child,
    },
    groups: {
      value: 'main',
    },
    interfaces: {
      value: () => s => ({ value: '12345' }),
    },
  }

  let SubChildV2: Component<any> = {
    name: 'SubChild',
    groups: {
      value: 'subchildV2',
    },
    interfaces: {
      value: () => s => ({ value: '21' }),
    },
  }

  let ChildV2: Component<any> = {
    name: 'Child',
    components: {
      subChild: SubChildV2,
    },
    groups: {
      value: 'childV2',
    },
    interfaces: {
      value: () => s => ({ value: 'V2' }),
    },
  }

  let CompV2: Component<any> = {
    name: 'Main',
    components: {
      b1: ChildV2,
    },
    groups: {
      value: 'V2',
    },
    interfaces: {
      value: () => s => ({ value: 'V2' }),
    },
  }

  it('should nest components', async (done) => {
    let count = 0
    let app = await setup(Comp, () => 0, group => {
      if (group[1] === 'childV2') {
        if (count === 1) {
          expect(group[0]).toEqual('Main$0')
          done()
        } else {
          count++
        }
      }
    })

    nest(app.ctx)('0', Child)

    app.moduleAPI.reattach(CompV2, mergeStates)
  })

  it('should dispatch an error when dynamic component dont references (refs) child components', async (done) => {
    let Child: Component<any> = {
      name: 'Child',
      components: {
        subChild: SubChild,
      },
      groups: {
        value: 'child',
      },
      interfaces: {
        value: () => s => ({ value: '17' }),
      },
    }
    let Comp: Component<any> = {
      name: 'Main',
      components: {
        b1: Child,
      },
      groups: {
        value: 'main',
      },
      interfaces: {
        value: () => s => ({ value: '12345' }),
      },
    }
    let app = await setup(Comp, () => 0, () => 0, (source, description) => {
      expect([source, description]).toEqual([
        'mergeStates',
        'there are no dynamic component definition of SubChild (defs) in Main$0'
      ])
      done()
    })

    nest(app.ctx)('0', Child)

    let ChildV2: Component<any> = {
      name: 'Child',
      components: {
        subChild: SubChildV2,
      },
      groups: {
        value: 'childV2',
      },
      interfaces: {
        value: () => s => ({ value: 'V2' }),
      },
    }

    let CompV2: Component<any> = {
      name: 'Main',
      components: {
        b1: ChildV2,
      },
      groups: {
        value: 'V2',
      },
      interfaces: {
        value: () => s => ({ value: 'V2' }),
      },
    }
    app.moduleAPI.reattach(CompV2, mergeStates)
  })

})
