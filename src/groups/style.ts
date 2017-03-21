import { createTypeStyle } from 'typestyle'
import { TypeStyle } from 'typestyle/lib/internal/typestyle'
import { styleGroup } from '../utils/style'
// insert styles in a DOM container at head

export const styleHandler = (containerName: string, debug = false) => mod => {
  let container = document.createElement('style')
  document.head.appendChild(container)
  let instance: TypeStyle = createTypeStyle(container)
  let state: any = {
    container,
    instance,
  }
  let name, parts, style
  return {
    state,
    handle: ([id, styleObj]) => {
      if (debug) {
        parts = id.split('$')
        name = parts[parts.length - 1]
      }
      style = styleGroup(instance, styleObj, name)
      mod.setGroup(id, 'style', style)
    },
    dispose: () => {
      state = {}
      container.remove()
    },
  }
}
