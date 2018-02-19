import { run, deepmerge, Module, logFns } from '../core'

export const ChildComp = {
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

export const createApp = (comp?, mod?): Promise<Module>  => {

  const Root = {
    state: { result: '' },
    inputs: F => ({}),
    actions: {},
    interfaces: {},
  }

  const DEV = true

  return run(deepmerge({
    Root: deepmerge(Root, comp || {}),
    record: DEV,
    log: DEV,
    interfaces: {},
    ...logFns,
  }, mod || {}))

}
