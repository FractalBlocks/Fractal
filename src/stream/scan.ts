import { Stream } from './index'

export default function (scanFn: { (a, b): any }, initialValue, source$: Stream<any>, dest$: Stream<any>) {
  dest$.set(initialValue)
  let subscriber = value => {
    dest$.set(scanFn(dest$.get(), value))
  }
  source$.subscribe(subscriber)
  return subscriber
}
