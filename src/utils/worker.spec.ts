import test from 'ava'
import { runWorker, WorkerAPI, runInWorker, ModuleDef } from '../core'

test('Should run a Module in a worker', async t => {

  const results = {
    interfaceValue: 0,
    groupValue: 0,
    taskValue: 0,
  }

  const moduleDef: ModuleDef = {
    Root: {
      state: { value: 10 },
      inputs: (s, F) => ({
        onInit: async () => {
          F.task('myTask', { value: 3 })
        },
      }),
      interfaces: {
        myInterface: async (s, F) => ({
          value: s.value,
          group: F.ctx.groups.myGroup.value
        }),
      },
      groups: { myGroup: { value: 7 } },
    },
    interfaces: {
      myInterface: mod => ({
        state: {},
        handle: async (id, value) => {
          results.interfaceValue = value.value
          results.groupValue = value.group
        },
        destroy: () => {},
      }),
    },
    groups: {
      myGroup: mod => ({
        state: {},
        handle: async (id, value) => {
          mod.setGroup(id, 'myGroup', { value: value.value + 1 })
        },
        destroy: () => {},
      }),
    },
    tasks: {
      myTask: mod => ({
        state: {},
        handle: async (id, value) => {
          results.taskValue = value.value
        },
        destroy: () => {},
      }),
    },
  }

  // worker side

  const workerContext: WorkerAPI = {
    postMessage: msg => setTimeout(() => worker.onmessage({ data: msg })),
  }

  runInWorker(moduleDef, undefined, workerContext)

  // Main thread

  const worker: WorkerAPI = {
    postMessage: msg => setTimeout(() => workerContext.onmessage({ data: msg })),
  }

  await runWorker({
    worker,
    ...moduleDef
  })

  t.is(results.interfaceValue, 10, 'should execute interface')
  t.is(results.groupValue, 8, 'should execute group')
  t.is(results.taskValue, 3, 'should execute task')

})
