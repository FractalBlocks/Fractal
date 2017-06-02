import {
  assoc,
  evolve,
  evolveKey,
  pipe,
  mapToObj,
  merge,
} from './fun'

describe('Functional utils', () => {

  describe('assoc', () => {

    it('should assoc a value to a key in an object', () => {
      let obj = {}
      assoc('key')('value')(obj)
      expect(obj['key']).toEqual('value')
    })

  })

  describe('evolve', () => {

    it('should apply many functions to the values of an object given the keys', () => {
      let obj = {
        count: 0,
      }
      evolve({
        count: x => x + 1,
        name: () => 'Fun',
      })(obj)
      expect(obj['count']).toEqual(1)
      expect(obj['name']).toEqual('Fun')
    })

  })

  describe('evolveKey', () => {

    it('should apply a function to a value of an object given the key', () => {
      let obj = { count: 0 }
      evolveKey('count')(x => x + 1)(obj)
      expect(obj['count']).toEqual(1)
    })

  })

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

  describe('merge helper', () => {

    it('should merge two objects', () => {
      expect(merge({ a: 1, b: 2 })({ c: 3, d: 4 })).toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      })
    })

  })

})
