import { newStream, Stream } from './index'
import scanStream from './scan'


describe('Scan stream (scanStream) functionality', function () {

  let source$ = newStream<number>(2)
  let dest$ = newStream<number>(undefined)
  let subscriber

  it('should have initial value', function () {
    subscriber = scanStream((a, b) => a + b, 1, source$, dest$)
    expect(+dest$.get()).toBe(1)
  })

  it('should scan when incoming value from source stream', function () {
    source$.set(3)
    expect(dest$.get()).toBe(4) // 1 (initial) + 3 (incoming)
  })

  it('should be disposed and no change from incoming values from source stream', function () {
    source$.unsubscribe(subscriber)
    dest$.set(0)
    source$.set(4)
    expect(dest$.get()).toBe(0) // the same value
  })

})
