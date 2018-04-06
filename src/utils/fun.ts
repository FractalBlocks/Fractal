// -- Functional functions (just fun)
// Use them for building actions in a declarative and concise way

export const assoc = (key: string) => (value: any) => obj => {
  obj[key] = value
  return obj
}

export interface FnIndex {
  [key: string]: { (any): any }
}

export const evolve = (index: FnIndex) => obj => {
  for (let key in index) {
    obj[key] = index[key](obj[key])
  }
  return obj
}

export const evolveKey = (key: string) => (fn: { (any): any }) => obj => {
  obj[key] = fn(obj[key])
  return obj
}

// pipe allows to pipe functions (left composing)
export function pipe (...args) {
  return function (value) {
    let result = value
    for (let i = 0, len = args.length; i < len; i++) {
      result = args[i](result)
    }
    return result
  }
}

export interface KeyValuePair extends Array<any> {
  0: string
  1: any
}

export function mapToObj<U> (arr: U[], fn: { (idx, value?: U): KeyValuePair } ): { [key: string]: any } {
  let result = {}, aux
  for (let i = 0, len = arr.length; i < len; i++) {
    aux = fn(i, arr[i])
    result[aux[0]] = aux[1]
  }
  return result
}

export function merge (objSrc) {
  return function (obj) {
    let key
    for (key in objSrc) {
      obj[key] = objSrc[key]
    }
    return obj
  }
}

import * as _deepmerge from 'deepmerge/dist/umd'

export const deepmerge = _deepmerge
export const deepmergeAll = _deepmerge.all

export interface AsyncMapFn<U, V> {
  (element: U, index: number, array: U[]): Promise<V>
}

export const mapAsync = async <U, V>(arr: U[], fn: AsyncMapFn<U, V>): Promise<V[]> => {
  let res = []
  for (let i = 0, len = arr.length; i < len; i++) {
    res[i] = await fn(arr[i], i, arr)
  }
  return res
}

export interface AsyncFilterFn<U> {
  (element: U, index: number, array: U[]): Promise<boolean>
}

export const filterAsync = async <U>(arr: U[], fn: AsyncFilterFn<U>): Promise<U[]> => {
  let res = []
  for (let i = 0, len = arr.length; i < len; i++) {
    if (await fn(arr[i], i, arr)) {
      res.push(arr[i])
    }
  }
  return res
}

export interface AsyncReduceFn<U, V> {
  (acumulator: V, element: U, index: number): Promise<V>
}

export const reduceAsync = async <U, V>(arr: U[], fn: AsyncReduceFn<U, V>, v0: V): Promise<V> => {
  for (let i = 0, len = arr.length; i < len; i++) {
    v0 = await fn(v0, arr[i], i)
  }
  return v0
}

export const all = async (arr: Promise<any>[]) => await Promise.all(arr)

export const seq = async (...arr: Promise<any>[]) => {
  let element
  for (element of arr) {
    await element
  }
}

export const range = (a: number, b: number) => {
  let res = []
  if (a < b) {
    b++
    for (; a < b; a++) {
      res.push(a)
    }
  } else {
    b--
    for (; a > b; a--) {
      res.push(a)
    }
  }
  return res
}

export const waitMS = (ms: number) => new Promise(res => setTimeout(res, ms))

// Math

export const sum = (numbers: number[]) => numbers.reduce((acc, n) => acc + n, 0)

// Path helpers

export const getPath = (path: string[], obj: any) => {
  let actual = obj
  for (let i = 0, len = path.length; i < len; i++) {
    actual = actual[path[i]]
  }
  return actual
}

export const getPaths = (paths: string[][], obj: any) => {
  let res = []
  for (let i = 0, path; path = paths[i]; i++) {
    res[i] = getPath(path, obj)
  }
  return res
}
