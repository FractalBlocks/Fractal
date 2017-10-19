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

export const getValue = (idx: number) => memoryDB[idx]

export const setValue = (idx: number, value: Item) => memoryDB[idx] = value

export const getDB = () => memoryDB
