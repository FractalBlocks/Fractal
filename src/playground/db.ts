import { computeEvent, _ } from "../core/index";

export interface Item {
  title: string
  body: string
  _timestamp: number
}

let value: any = localStorage.getItem('memoryDB')

if (value) {
  value = JSON.parse(value)
} else {
  value = {}
  localStorage.setItem('memoryDB', '{}')
}

let memoryDB: { [id: string]: Item } = value

const save = () => localStorage.setItem('memoryDB', JSON.stringify(memoryDB))

export const getItem = (id: string) => memoryDB[id]

export const setItem = (id: string, item: Item) => {
  memoryDB[id] = item
  changed(['set', id, item])
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
  setTimeout(() => save())
}

export const getDB = () => memoryDB

const getData = pattern => pattern === '*' ? memoryDB : memoryDB[pattern]

export const dbTask = () => mod => {
  let subs = []
  changeListener = evData => {
    for (let i = 0, sub; sub = subs[i]; i++) {
      if (sub[1] === '*') {
        mod.dispatch(computeEvent(evData, <any> sub[3]))
      } else if (sub[1] === evData[1]) {
        mod.dispatch(computeEvent(evData, <any> sub[2]))
      }
    }
  }

  return {
    state: _,
    handle: async ([name, ...data]) => {
      let result
      if (name === 'getItem') {
        result = getItem(data[0])
      } else if (name === 'setItem') {
        setItem(data[0], data[1])
        return
      } else if (name === 'addItem') {
        result = addItem(data[0])
      } else if (name === 'getDB') {
        result = getDB()
      } else if (name === 'remove') {
        removeItem(data[0])
        return
      } else if (name === 'subscribe') {
        let sub = data
        subs.push(sub)
        // initial fetch
        await mod.dispatch(computeEvent(getData(sub[1]), <any> sub[2]))
        return
      } else if (name === 'unsubscribe') {
        let idx = -1
        for (let i = 0, sub; sub = subs[i]; i++) {
          if (data[0] === sub[0] && data[1] === sub[1] && data[2] === sub[2]) {
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
      if (data[1]) {
        await mod.dispatch(computeEvent(result, <any> data[1]))
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
