import {
  run,
  Module,
  Component,
  // DEV
  logFns,
  RunModule,
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
    db: DB.dbTask(),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // ...logFns,
})
