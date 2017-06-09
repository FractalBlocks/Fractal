
import { isDescendant } from './utils'

describe('View helpers', () => {

  describe('isDescendant evaluate if an element is descendant of another element', () => {

    let ancestor = document.createElement('div')
    let intermediate = document.createElement('div')
    ancestor.appendChild(intermediate)
    let descendant = document.createElement('div')
    intermediate.appendChild(descendant)
    let notDescendant = document.createElement('div')

    it('should return true if the element is decendant of the other', () => {
      expect(isDescendant(ancestor, descendant)).toEqual(true)
    })

    it('should return false if the element is not decendant of the other', () => {
      expect(isDescendant(ancestor, notDescendant)).toEqual(false)
    })

  })

})
