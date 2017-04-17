import {
  pipe,
  mapToObj,
} from './fun'

describe('Component helpers', () => {

  describe('pipe function for piping functions', () => {
    let fun = pipe(
      x => x + 1,
      x => x + 1,
      x => x - 1,
      x => x * 2,
    )

    it('should return the rigth result', () => {
      expect(fun(0)).toBe(2)
      expect(fun(1)).toBe(4)
      expect(fun(2)).toBe(6)
      expect(fun(3)).toBe(8)
    })

  })

  describe('mapToObj helper', () => {

    it('should map an array to an object', () => {
      expect(mapToObj([1, 2, 3], (idx, value) => ['a' + idx, `a${value}elm`])).toEqual({
        a0: 'a1elm',
        a1: 'a2elm',
        a2: 'a3elm',
      })
    })

  })

})
