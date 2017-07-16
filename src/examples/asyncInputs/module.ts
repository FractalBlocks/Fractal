import {
  run,
  Module,
  Component,
  // DEV
  logFns,
} from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

export const runModule = (root: Component<any>, DEV = false): Module => run({
  root,
  groups: {
    style: styleHandler('', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  ...logFns,
})
