import { ModuleDef } from '../core'
import { styleHandler } from '../groups/style'
import { viewHandler } from '../interfaces/view'
import * as Root from './Root'

const DEV = true

export const moduleDef: ModuleDef = {
  Root,
  record: DEV,
  log: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
}
