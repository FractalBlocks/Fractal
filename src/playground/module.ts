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

export const runModule: RunModule = (root: Component<any>, DEV = false): Promise<Module> => run({
  root,
  record: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})
