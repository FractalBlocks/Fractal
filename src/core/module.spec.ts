import test from 'ava'
import { clone } from '.'
import { createApp, ChildComp } from './testUtils'

// Propagation tests

test('Propagation: Individual', async t => {
  const app = await createApp({
    state: {
      _nest: {
        Child: clone(ChildComp),
      },
    },
    inputs: (s, F) => ({
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
    inputs: (s, F) => ({
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
    inputs: (s, F) => ({
      $_changed: async r => await F.set('result', r),
    })
  })
  await app.moduleAPI.toComp('Root$A_1', 'inc')
  t.deepEqual(app.rootCtx.components.Root.state.result, ['A_1', 1], 'Expect the component name and the value')
})
