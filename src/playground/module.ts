import {
  run,
  Module,
  Component,
  // DEV
  RunModule,
} from '../core'
import { viewHandler } from '../interfaces/view'
import { routeHandler } from '../interfaces/route'
import { styleHandler } from '../groups/style'
import * as DB from './db'

export const runModule: RunModule = async (Root: Component<any>, DEV = false): Promise<Module> => run({
  Root,
  record: DEV,
  log: DEV,
  groups: {
    style: styleHandler('', DEV),
  },
  tasks: {
    db: DB.dbTask(),
  },
  interfaceOrder: ['route', 'view'],
  interfaces: {
    route: routeHandler('/', 'hash'),
    view: viewHandler('#app'),
  },
})
