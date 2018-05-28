import { Handler, styleGroup } from '../core'
import { createTypeStyle } from 'typestyle'
import { TypeStyle } from 'typestyle/lib/internal/typestyle'

// insert styles in a DOM container at head

export const styleHandler: Handler = (containerName?: string, debug = false, groupName = 'style') => mod => {
  let container
  if (typeof window !== 'undefined') {
    container = document.createElement('style')
    // named container
    if (containerName !== '' && containerName !== undefined) {
      container.id = containerName
    }
    document.head.appendChild(container)
  }
  let instance: TypeStyle = createTypeStyle(container)
  let state: any = {
    container,
    instance,
  }
  let name, parts, style
  return {
    state,
    handle: async (id, styleObj) => {
      if (debug) {
        parts = id.split('$')
        name = parts[parts.length - 1]
      }
      style = styleGroup(instance, styleObj, name)
      instance.forceRenderStyles()
      mod.setGroup(id, groupName, style)
    },
    destroy: () => {
      state = {}
      if (container) {
        container.remove()
      }
    },
  }
}
