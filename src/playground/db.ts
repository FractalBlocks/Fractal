import { Handler, _ } from '../core/index'

export interface Item {
  title: string
  body: string
  _timestamp: number
}

let value: any = {}

if (typeof window !== 'undefined') {
  let isInitialized = localStorage.getItem('memoryDB')
  value = JSON.parse(isInitialized || '{}')
  if (!isInitialized) {
    localStorage.setItem('memoryDB', '{}')
  }
}

let memoryDB: { [id: string]: Item } = value

export const getItem = (id: string) => memoryDB[id]

export const setItem = (id: string, item: Item) => {
  memoryDB[id] = item
  changed(['set', id, item])
  return item
}

export const setItemProps = (id: string, itemProps: any) => {
  memoryDB[id] = {
    ...memoryDB[id],
    ...itemProps,
  }
  changed(['set', id, memoryDB[id]])
  return memoryDB[id]
}

export const addItem = (item: Item) => {
  let id = guid()
  memoryDB[id] = item
  changed(['add', id, item])
  return id
}

export const removeItem = (id: string) => {
  delete memoryDB[id]
  changed(['remove', id])
}

let changeListener
function changed (evData) {
  if (changeListener) {
    changeListener(evData)
  }
  save()
}

const save = () => localStorage.setItem('memoryDB', JSON.stringify(memoryDB))

export const getDB = () => memoryDB

const getData = pattern => pattern === '*' ? memoryDB : memoryDB[pattern]

export const dbTask: Handler = () => mod => {
  let subs = []
  changeListener = evData => {
    for (let i = 0, sub; sub = subs[i]; i++) {
      mod.dispatchEv(evData, <any> sub[2])
    }
  }

  return {
    state: _,
    handle: async ([name, ...data]) => {
      if (name === 'getItem') {
        return getItem(data[0])
      } else if (name === 'setItem') {
        return setItem(data[0], data[1])
      } else if (name === 'setItemProps') {
        return setItemProps(data[0], data[1])
      } else if (name === 'addItem') {
        return addItem(data[0])
      } else if (name === 'getDB') {
        return getDB()
      } else if (name === 'remove') {
        removeItem(data[0])
        return 'removed'
      } else if (name === 'subscribe') {
        let sub = data
        subs.push(sub)
        // initial fetch
        return getData(sub[1])
      } else if (name === 'unsubscribe') {
        let idx = -1
        for (let i = 0, sub; sub = subs[i]; i++) {
          if (data[0] === sub[0] && data[1] === sub[1]) {
            idx = i
          }
        }
        if (idx !== -1) {
          subs.splice(idx, 1)
          return
        }
      } else {
        mod.error('db handler', `Unhandled command type '${name}'`)
        return
      }
    },
    dispose: () => {},
  }
}

function guid () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
