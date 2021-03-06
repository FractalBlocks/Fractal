import { run, Module } from '../core'
import { guid } from '../utils/fun'
import { styleHandler } from '../groups/style'
import { viewHandler } from '../interfaces/view'

import * as AppViewer from './AppViewer'

export const attachAppViewer = async (app: Module): Promise<Module> => {
  if (typeof window === undefined) return
  const id = guid().replace(/-/g, '')
  const appViewerElm = document.createElement('div')
  appViewerElm.id = '_' + id
  document.body.appendChild(appViewerElm)
  return run({
    Root: AppViewer,
    groups: {
      style: styleHandler(),
    },
    interfaces: {
      view: viewHandler('#_' + id),
    },
  })
}
