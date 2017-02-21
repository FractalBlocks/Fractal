// insert styles in a DOM container at head

import { Handler } from '../handler'

export const styleTask: Handler = (containerName: string) => mod => {
  let container = document.createElement('style')
  document.head.appendChild(container)

  return {
    state: container,
    handle: style => {
      container.innerHTML = <any> style
    },
    dispose: () => {
      container.remove()
    },
  }
}
