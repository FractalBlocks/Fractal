
export interface Stream<T> {
  set(val: T): void
  get(): T | undefined
  subscribers: [Subcription<T>] | undefined[]
  subscribe(subscriber: Subcription<T>): void
  unsubscribe(subscriber: Subcription<T>): boolean
}

export interface Subcription<T> {
  (value: T): void
}

export function newStream<T>(initialValue: T | undefined): Stream<T> {
  let subscribers = []
  let state = {
    value: initialValue
  }
  function notify(value) {
    for(let i = 0, subs; subs = subscribers[i]; i++) {
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
    subscribers,
    unsubscribe(subscriber) {
      let index = subscribers.indexOf(subscriber)
      if (index != -1) {
        subscribers.splice(index, 1)
        return true
      } else {
        return false
      }
    },
    subscribe(subscriber) {
      subscribers.push(subscriber)
    },
  }
}
