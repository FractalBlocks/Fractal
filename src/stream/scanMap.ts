import { Stream } from './index'

export default function (scanFn: { (a, b): any }, initialValue, mapFn: { (a): any }, source$: Stream<any>, dest$: Stream<any>) {
  dest$.set(initialValue)
  let subscriber = value => {
    dest$.set(scanFn(dest$.get(), mapFn(value)))
  }
  source$.subscribe(subscriber)
  return subscriber
}
