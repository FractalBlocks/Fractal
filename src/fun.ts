
export const assoc = (key: string) => (value: string) => obj => {
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
