import { createTypeStyle } from 'typestyle'
import { TypeStyle } from 'typestyle/lib/internal/typestyle'
import { styleGroup } from '../utils/style'
import { Handler } from '../handler'
// insert styles in a DOM container at head

export const styleTask: Handler = (containerName: string) => mod => {
  let container = document.createElement('style')
  document.head.appendChild(container)
  let instance: TypeStyle = createTypeStyle(container)
  let state: any = {
    container,
    instance,
  }
  return {
    state,
    handle: ([id, styleObj]) => {
      let style = styleGroup(instance, styleObj, name)
      mod.set(id, 'style', style)
    },
    dispose: () => {
      state = {}
      container.remove()
    },
  }
}
