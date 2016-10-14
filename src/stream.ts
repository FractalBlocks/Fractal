
export interface Stream<T> {
  subscriptions: [Subcription<T>]
  subscribe(subscription: Subcription<T>): boolean
  unsubscribe(subscription: Subcription<T>): boolean
}

export interface Subcription<T> {
  (value: T): void
}
