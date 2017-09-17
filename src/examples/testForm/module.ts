import {
  run,
  Module,
  Component,
  // DEV
  logFns,
  RunModule,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

export const runModule: RunModule = (root: Component<any>, DEV = false): Promise<Module> => run({
  root,
  groups: {
    style: styleHandler('', true),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})
