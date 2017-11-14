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

export function mapToObj (arr: any[], fn: { (idx, value?): KeyValuePair } ): any {
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

export const mapAsync = async (arr: any[], fn) => {
  let res = []
  for (let i = 0, len = arr.length; i < len; i++) {
    res[i] = await fn(arr[i], i, arr)
  }
  return res
}

export const filterAsync = async (arr: any[], fn) => {
  let res = []
  for (let i = 0, len = arr.length; i < len; i++) {
    if (await fn(arr[i], i, arr)) {
      res.push(arr[i])
    }
  }
  return res
}

export const reduceAsync = async (arr: any[], fn, v0: any) => {
  for (let i = 0, len = arr.length; i < len; i++) {
    v0 = await fn(v0, arr[i], i)
  }
  return v0
}

export const all = async (arr: Promise<any>[]) => await Promise.all(arr)
