import { run, deepmerge, Module, logFns } from '../core'

export const ChildComp = {
  state: { count: 0 },
  inputs: (s, F) => ({
    inc: async () => {
      await F.toAct('Inc')
      await F.toIn('changed', F.stateOf().count)
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

export const createApp = (comp?, mod?): Promise<Module>  => {

  const Root = {
    state: { result: '' },
    inputs: (s, F) => ({}),
    actions: {},
    interfaces: {},
  }

  const DEV = true

  return run(deepmerge({
    Root: deepmerge(Root, comp || {}),
    record: DEV,
    log: DEV,
    interfaces: {},
    error: logFns.error,
  }, mod || {}))

}
