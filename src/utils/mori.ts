import { hashMap, HashMap, get as moriGet, conj } from 'mori'


// TODO: test it!!
export function evolve(..._args): { (hashMapObj: HashMap<string, any>): HashMap<string, any> } {
  return function (hashMapObj) {
    let changes = []
    for (let i = 0, len = _args.length; i < len; i++) {
      if (i % 2 === 0) {
        let value = moriGet(hashMapObj, _args[i])
        if (value !== undefined) {
          changes[i] = _args[i]
          changes[i + 1] = _args[i + 1](value)
        }
      }
    }
    let changeHashMap = hashMap.apply(null, changes)
    return conj(hashMapObj, changeHashMap)
  }
}

export const get = moriGet<string, any>

