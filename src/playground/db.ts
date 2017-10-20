import { computeEvent, _, Interface } from "../core/index";

export interface Item {
  title: string
  body: string
}

let value: any = localStorage.getItem('memoryDB')

if (value) {
  value = JSON.parse(value)
} else {
  value = []
  localStorage.setItem('memoryDB', '[]')
}

let memoryDB: Item[] = value

const save = () => localStorage.setItem('memoryDB', JSON.stringify(memoryDB))

export const getItem = (idx: number) => memoryDB[idx]

export const setItem = (idx: number, item: Item) => {
  memoryDB[idx] = item
  save()
}

export const addItem = (item: Item) => {
  memoryDB.push(item)
  save()
}

export const removeItem = (idx: number) => {
  console.log(idx)
  memoryDB.splice(idx, 1)
  save()
}

export const getDB = () => memoryDB

export const dbTask = () => mod => ({
  state: _,
  handle: async ([name, data, cb]) => {
    let result
    if (name === 'getItem') {
      result = getItem(data)
    } else if (name === 'setItem') {
      result = setItem(data[0], data[1])
    } else if (name === 'addItem') {
      result = addItem(data)
    } else if (name === 'getDB') {
      result = getDB()
    } else if (name === 'remove') {
      result = removeItem(data)
    } else {
      mod.error('db handler', `Unhandled command type '${name}'`)
    }
    if (cb) {
      await mod.dispatch(computeEvent(result, cb))
    }
  },
  dispose: () => {},
})
