import eventInterface from './event'
import testBed from './_testBed'
import { newStream } from '../stream'


  describe('Event interface behaviours', function() {

    let interfaceMsg$ = newStream<any>(undefined)

    function onValue(val) {
      interfaceMsg$.set(val)
    }

    testBed(i => (ctx, s) => ({
      count: s.count,
      subscribe: i.inc(ctx),
    }), eventInterface(onValue))

    it('should have initial state', function() {
      let interfaceMsg = interfaceMsg$.get()
      expect(interfaceMsg.count).toBe(0)
    })

    it('should react to input', done => {
      interfaceMsg$.subscribe(interfaceMsg => {
        expect(interfaceMsg.count).toBe(1)
        done()
      })
      interfaceMsg$.get().subscribe()
    })

  })
