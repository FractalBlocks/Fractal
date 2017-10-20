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
        let result
        if (name === 'getItem') {
          result = DB.getItem(data)
        } else if (name === 'setItem') {
          result = DB.setItem(data[0], data[1])
        } else if (name === 'addItem') {
          result = DB.addItem(data)
        } else if (name === 'getDB') {
          result = DB.getDB()
        }
        if (cb) {
          await mod.dispatch(computeEvent(result, cb))
        }
      },
      dispose: () => {},
    }),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})
