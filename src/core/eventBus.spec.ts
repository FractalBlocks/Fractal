import test from 'ava'
import { clone, _ } from '../core'
import { createApp } from '../core/testUtils'

// Event Bus tests

export const ChildComp = {
  state: { result: '', count: 0 },
  inputs: (s, F) => ({
    inc: async () => {
      let state = F.stateOf()
      await F.toAct('Inc')
      let res = await F.emit('myEvent', state.count)
      debugger
      await F.set('result', res)
    },
    changed: async value => {},
  }),
  actions: {
    Inc: () => s => {
      s.count++
    },
  },
  interfaces: {},
}

export const ReceptorComp = {
  state: {},
  inputs: (s, F) => ({
    onInit: async () => {
      F.on('myEvent', F.in('myEvent', _, '*'), true)
    },
    myEvent: async count => {
      return count * 3 + 1
    },
  }),
  actions: {},
  interfaces: {},
}

test('Event bus with pullable and normal subscribers', async t => {
  const app = await createApp({
    state: {
      result: '',
      _nest: {
        Child: clone(ChildComp),
        R1: clone(ReceptorComp),
        R2: clone(ReceptorComp),
        R3: clone(ReceptorComp),
      },
    },
    inputs: (s, F) => ({
      onInit: async () => {
        F.on('myEvent', F.in('myEvent', _, '*'))
      },
      myEvent: async count => {
        await F.set('result', count)
      },
    }),
  })

  await app.moduleAPI.toComp('Root$Child', 'inc')
  t.is(app.rootCtx.components.Root.state.result, 1, 'Should propagate events to not pullable susbscribers')
  t.deepEqual(app.rootCtx.components.Root$Child.state.result, [4, 4, 4], 'Should pull results from subscribers before sending the event')
})
