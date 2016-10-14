
import { Stream, newStream } from '../src/stream'

describe('Stream spec', function() {
  let stream$: Stream<number>
  it('Should return initial value', function() {
    stream$ = newStream<number>(12)
    expect(stream$.value(undefined)).toBe(12)
  })
  it('Should change the value', function() {
    stream$.value(102)
    expect(stream$.value(undefined)).toBe(102)
  })
  let sideEffect: number | undefined = undefined
  let subscriber = function(value: number) {
    sideEffect = value
  }
  it('Should subscribe a function', function() {
    stream$.subscribe(subscriber)
    stream$.value(234)
    expect(sideEffect).toBe(234)
  })
  it('Should unsubscribe a function', function() {
    sideEffect = undefined
    stream$.unsubscribe(subscriber)
    stream$.value(401)
    expect(sideEffect).toBe(undefined)
  })
})
