import { newStream, Stream } from './index'
import mapStream from './map'


describe('Map stream (mapStream) functionality', function () {

  let source$ = newStream<number>(2)
  let dest$ = newStream<number>(1)
  let subscriber

  it('should have initial value', function () {
    subscriber = mapStream(a => a + 1, source$, dest$)
    expect(dest$.get()).toBe(1)
  })

  it('should scan when incoming value from source stream', function () {
    source$.set(7)
    expect(dest$.get()).toBe(8) // mapFn(7) = 8
  })

  it('should be disposed and no change from incoming values from source stream', function () {
    source$.unsubscribe(subscriber)
    dest$.set(0)
    source$.set(4)
    expect(dest$.get()).toBe(0) // the same value
  })

})
