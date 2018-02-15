import test from 'ava'
import { run, clone, deepmerge } from '../core'

// Propagation tests

const ChildComp = {
  state: { count: 0 },
  inputs: F => ({
    inc: async () => {
      await F.toAct('Inc')
      await F.toIt('changed', F.stateOf().count)
    },
    changed: async value => {},
  }),
  actions: {
    Inc: () => s => {
      s.count++
      return s
    },
  },
  interfaces: {},
}

const createApp = (comp?) => {

  const Root = {
    state: { result: '' },
    inputs: F => ({}),
    actions: {},
    interfaces: {},
  }

  const DEV = true

  return run({
    Root: deepmerge(Root, comp || {}),
    record: DEV,
    log: DEV,
    interfaces: {},
  })

}

test('Propagation: Individual', async t => {
  const app = await createApp({
    state: {
      _nest: {
        Child: clone(ChildComp),
      },
    },
    inputs: F => ({
      $Child_changed: async r => await F.set('result', r), // Individual propagation
    })
  })
  await app.moduleAPI.toComp('Root$Child', 'inc')
  t.deepEqual(app.rootCtx.components.Root.state.result, 1, 'Expect the input value')
})

test('Propagation: Groupal', async t => {
  const app = await createApp({
    state: {
      _nest: {
        A_1: clone(ChildComp),
        A_2: clone(ChildComp),
        A_3: clone(ChildComp),
      },
    },
    inputs: F => ({
      $A_changed: async r => await F.set('result', r),
    })
  })
  await app.moduleAPI.toComp('Root$A_2', 'inc')
  t.deepEqual(app.rootCtx.components.Root.state.result, ['2', 1], 'Expect the component scoped name and the value')
})


test('Propagation: Global', async t => {
  const app = await createApp({
    state: {
      _nest: {
        A_1: clone(ChildComp),
        B: clone(ChildComp),
        A_2: clone(ChildComp),
        C: clone(ChildComp),
      },
    },
    inputs: F => ({
      $_changed: async r => await F.set('result', r),
    })
  })
  await app.moduleAPI.toComp('Root$A_1', 'inc')
  t.deepEqual(app.rootCtx.components.Root.state.result, ['A_1', 1], 'Expect the component name and the value')
})
