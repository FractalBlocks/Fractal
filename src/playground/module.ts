import {
  run,
  Module,
  Component,
  // DEV
  logFns,
  RunModule,
  _,
  computeEvent,
} from '../core'
import { viewHandler } from '../interfaces/view'
import { styleHandler } from '../groups/style'
import * as DB from './db'

export const runModule: RunModule = (root: Component<any>, DEV = false): Promise<Module> => run({
  root,
  record: DEV,
  log: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  tasks: {
    db: mod => ({
      state: _,
      handle: async ([name, data, cb]) => {
        let result = DB[name].apply(null, data)
        mod.dispatch(computeEvent(result, cb))
      },
      dispose: () => {},
    }),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})
