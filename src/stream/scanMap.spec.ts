import { newStream, Stream } from './index'
import scanMapStream from './scanMap'


describe('Scan map stream (scanMapStream) functionality', function () {

  let source$ = newStream<number>(2)
  let dest$ = newStream<number>(undefined)
  let subscriber

  it('should have initial value', function () {
    subscriber = scanMapStream((a, b) => a + b, 1, x => x * 2, source$, dest$)
    expect(dest$.get()).toBe(1)
  })

  it('should scan when incoming value from source stream', function () {
    source$.set(3)
    expect(dest$.get()).toBe(7) // 1 (initial) + 6 (incoming-mapped)
  })

  it('should be disposed and no change from incoming values from source stream', function () {
    source$.unsubscribe(subscriber)
    dest$.set(0)
    source$.set(4)
    expect(dest$.get()).toBe(0) // the same value
  })

})
