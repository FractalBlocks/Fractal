export interface Defaults {
  [propName: string]: any
}

export function defaultValues<T>(defaults: Defaults): DefaultParams<T>  {
  return function(object) {
    let newObject: Defaults = {}
    for (let key in defaults) {
      newObject[key] = defaults[key]
    }
    for (let key in object) {
      newObject[key] = object[key]
    }
    return <T> newObject
  }
}

export interface DefaultParams<T> {
  (object: Defaults): T
}
