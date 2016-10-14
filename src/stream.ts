
export interface Stream<T> {
  set(val: T): void
  get(): T | undefined
  subscriptions: [Subcription<T>] | undefined[]
  subscribe(subscription: Subcription<T>): void
  unsubscribe(subscription: Subcription<T>): boolean
}

export interface Subcription<T> {
  (value: T): void
}

export function newStream<T>(initialValue: T | undefined): Stream<T> {
  let subscriptions = []
  let state = {
    value: initialValue
  }
  function notify(value) {
    for(let i = 0, subs; subs = subscriptions[i]; i++) {
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
    subscriptions,
    unsubscribe(subscription) {
      let index = subscriptions.indexOf(subscription)
      if (index != -1) {
        subscriptions.splice(index, 1)
        return true
      } else {
        return false
      }
    },
    subscribe(subscription) {
      subscriptions.push(subscription)
    },
  }
}
