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
  memoryDB.splice(idx, 1)
  save()
}

export const getDB = () => memoryDB
