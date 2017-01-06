import { Stream } from './index'
import mapStream from './map'


export default function (mapFn, source$: Stream<any>, dest$: Stream<any>) {
  let subscriber = value => {
    dest$.set(mapFn(value))
  }
  source$.subscribe(subscriber)
  return subscriber
}
