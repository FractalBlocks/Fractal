import { newStream, Stream } from './index'


describe('Implementation of a basic stream', function () {

  let stream$: Stream<number>

  it('Should create a new stream', function () {
    stream$ = newStream<number>(12)
    expect(stream$.set).toBeDefined()
    expect(stream$.get).toBeDefined()
    expect(stream$.subscribe).toBeDefined()
    expect(stream$.unsubscribe).toBeDefined()
    expect(stream$.removeSubscribers).toBeDefined()
    expect(stream$.dispose).toBeDefined()
  })

  it('Should return initial value', function () {
    expect(stream$.get()).toBe(12)
  })

  it('Should change the value', function () {
    stream$.set(102)
    expect(stream$.get()).toBe(102)
  })

  let sideEffect: number | undefined = undefined
  let sideEffect2: number | undefined = undefined
  let subscriber = function (value: number) {
    sideEffect = value
  }
  let subscriber2 = function (value: number) {
    sideEffect2 = value
  }

  it('Should subscribe functions', function () {
    stream$.subscribe(subscriber)
    stream$.subscribe(subscriber2)
    stream$.set(234)
    expect(sideEffect).toBe(234)
    expect(sideEffect2).toBe(234)
  })

  it('Should unsubscribe a single function and return true if is already subscribed', function () {
    sideEffect = undefined
    sideEffect2 = undefined
    let result = stream$.unsubscribe(subscriber2)
    expect(result).toBe(true)
    stream$.set(401)
    expect(sideEffect).toBe(401)
    expect(sideEffect2).toBe(undefined)
    stream$.unsubscribe(subscriber)
  })

  it('Should return true if try to unsubscribe a function that is not subscribed', function () {
    let result = stream$.unsubscribe(subscriber2)
    expect(result).toBe(false)
  })

  it('Should be chainable', function () {
    let stream1$: Stream<number> = newStream<number>(12)
    let stream2$: Stream<number> = newStream<number>(330)
    stream1$.subscribe(stream2$.set)
    stream1$.set(234)
    expect(stream1$.get()).toBe(stream2$.get())
  })

  it('Should have a method for remove all listeners', function () {
    sideEffect = undefined
    sideEffect2 = undefined
    stream$.subscribe(subscriber)
    stream$.subscribe(subscriber2)
    stream$.removeSubscribers()
    stream$.set(401)
    expect(sideEffect).toBe(undefined)
    expect(sideEffect2).toBe(undefined)
  })

  it('Should be disposable', function () {
    stream$.dispose()
    expect(stream$.set).toBeNull()
    expect(stream$.set).toBeNull()
    expect(stream$.subscribe).toBeNull()
    expect(stream$.unsubscribe).toBeNull()
    expect(stream$.removeSubscribers).toBeNull()
    expect(stream$.dispose).toBeNull()
  })

})
