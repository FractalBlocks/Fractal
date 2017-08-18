import { computeEvent } from '../core/interface'

export const sizeHandler = () => mod => ({
  state: undefined,
  handle: async ([selector, prop, cb]) => {
    let elements: HTMLElement[] = document.querySelectorAll(selector)
    let propValues = []
    for (let i = 0, len = elements.length; i < len; i++) {
      let element = elements[i]
      let bbox = element.getBoundingClientRect()
      propValues.push(bbox[prop])
    }
    mod.dispatch(computeEvent(propValues, cb))
  },
  dispose: () => {},
})
