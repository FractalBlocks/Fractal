import test from 'ava'
import { clone } from './utils'

test('Clone an object', t => {
  const obj = {
    nested: {
      deep: {
        a: 1,
        b: [1, 2, 3, { z:10 }],
      }
    },
    arr: ['a', 2, { key: 'value' }],
  }
  t.deepEqual(clone(obj), obj)
})
