
export interface Stream<T> {
  value(val: T | undefined): T | undefined
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
  let stateProxy = new Proxy<any>(state, {
    set(target, name, value) {
      target[name] = value
      notify(value)
      return true
    },
  })
  function notify(value) {
    for(let i = 0, subs; subs = subscriptions[i]; i++) {
      subs(value)
    }
  }
  return {
    value(val) {
      if (val !== undefined) {
        stateProxy.value = val
      } else {
        return state.value
      }
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
