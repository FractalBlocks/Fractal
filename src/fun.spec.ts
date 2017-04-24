import {
  assoc,
  evolve,
  evolveKey,
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

})
