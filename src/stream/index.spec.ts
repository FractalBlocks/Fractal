import { newStream, Stream } from './index'


describe('Implementation of a basic stream', function() {

  let stream$: Stream<number>

  it('Should return initial value', function() {
    stream$ = newStream<number>(12)
    expect(stream$.get()).toBe(12)
  })

  it('Should change the value', function() {
    stream$.set(102)
    expect(stream$.get()).toBe(102)
  })

  let sideEffect: number | undefined = undefined
  let subscriber = function(value: number) {
    sideEffect = value
  }

  it('Should subscribe a function', function() {
    stream$.subscribe(subscriber)
    stream$.set(234)
    expect(sideEffect).toBe(234)
  })

  it('Should unsubscribe a function', function() {
    sideEffect = undefined
    stream$.unsubscribe(subscriber)
    stream$.set(401)
    expect(sideEffect).toBe(undefined)
  })

  it('Should be chainable', function() {
    let stream1$: Stream<number> = newStream<number>(12)
    let stream2$: Stream<number> = newStream<number>(330)
    stream1$.subscribe(stream2$.set)
    stream$.unsubscribe(subscriber)
    stream1$.set(234)
    expect(stream1$.get()).toBe(stream2$.get())
  })

  it('Should be disposable', function() {
    stream$.dispose()
    expect(stream$.set).toBeNull()
    expect(stream$.set).toBeNull()
    expect(stream$.subscribe).toBeNull()
    expect(stream$.unsubscribe).toBeNull()
    expect(stream$.removeSubscribers).toBeNull()
    expect(stream$.dispose).toBeNull()
  })

})
