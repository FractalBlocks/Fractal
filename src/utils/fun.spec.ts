import test from 'ava'
import {
  assoc,
  evolve,
  evolveKey,
  pipe,
  mapToObj,
  merge,
} from './fun'
import { mapAsync, filterAsync, reduceAsync, all, range } from '.';

// Functional utils tests

test('assoc', t => {

  let obj = {}
  assoc('key')('value')(obj)
  t.is(obj['key'], 'value', 'should assoc a value to a key in an object')

})

test('evolve: should apply many functions to the values of an object given the keys', t => {

  let obj = {
    count: 0,
  }
  evolve({
    count: x => x + 1,
    name: () => 'Fun',
  })(obj)
  t.is(obj['count'], 1)
  t.is(obj['name'], 'Fun')

})

test('evolveKey', t => {

  let obj = { count: 0 }
  evolveKey('count')(x => x + 1)(obj)
  t.is(
    obj['count'],
    1,
    'should apply a function to a value of an object given the key'
  )

})

test('pipe function for piping functions', t => {
  let fun = pipe(
    x => x + 1,
    x => x + 1,
    x => x - 1,
    x => x * 2,
  )

  t.is(fun(0), 2)
  t.is(fun(1), 4)
  t.is(fun(2), 6)
  t.is(fun(3), 8)

})

test('mapToObj helper', t => {

  t.deepEqual(
    mapToObj([1, 2, 3], (idx, value) => ['a' + idx, `a${value}elm`]),
    {
      a0: 'a1elm',
      a1: 'a2elm',
      a2: 'a3elm',
    }
  )

})

test('merge helper', t => {

  t.deepEqual(
    merge({ a: 1, b: 2 })({ c: 3, d: 4 }),
    {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }
  )

})

test('mapAsync helper', async t => {

  t.deepEqual(
    await mapAsync([1, 2, 3, 4], async (el, i, array) => [el, i]),
    [[1, 0], [2, 1], [3, 2], [4, 3]],
  )

})

test('filterAsync helper', async t => {

  t.deepEqual(
    await filterAsync([1, 2, 3, 4], async el => el < 3),
    [1, 2],
  )

})

test('reduceAsync helper', async t => {

  t.deepEqual(
    await reduceAsync([1, 2, 3, 4], async (ac, el, i) => ac.concat([el, i]), []),
    [1, 0, 2, 1, 3, 2, 4, 3],
  )

})

test('all helper', async t => {

  t.deepEqual(
    await all([1, 2, 3, 4].map(el => Promise.resolve(el))),
    [1, 2, 3, 4],
  )

})

test('range helper', async t => {

  t.deepEqual(
    await range(1, 4),
    [1, 2, 3, 4],
    'Ascendant range',
  )

  t.deepEqual(
    await range(4, -4),
    [4, 3, 2, 1, 0, -1, -2, -3, -4],
    'Descendant range',
  )

})

