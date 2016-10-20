
export interface Stream<T> {
  set(val: T): void
  get(): T | undefined
  subscribe(subscriber: Subcription<T>): void
  unsubscribe(subscriber: Subcription<T>): boolean
  removeSubscribers(subscriber: Subcription<T>): void
}

export interface Subcription<T> {
  (value: T): void
}

export function newStream<T>(initialValue: T | undefined): Stream<T> {
  let _subscribers = []
  let state = {
    value: initialValue
  }
  function notify(value) {
    for(let i = 0, subs; subs = _subscribers[i]; i++) {
      subs(value)
    }
  }
  return {
    set(value) {
      state.value = value
      notify(value)
    },
    get() {
      return state.value
    },
    removeSubscribers() {
      _subscribers = []
    },
    unsubscribe(subscriber) {
      let index = _subscribers.indexOf(subscriber)
      if (index != -1) {
        _subscribers.splice(index, 1)
        return true
      } else {
        return false
      }
    },
    subscribe(subscriber) {
      _subscribers.push(subscriber)
    },
  }
}
