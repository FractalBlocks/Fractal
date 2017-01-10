import { Engine } from '../index'
import { viewHandler } from './view'
import testBed from './_testBed.spec'
import h from 'snabbdom/h'


  describe('View interface behaviours', function() {

    // Element placeholder for inserting the app
    let appElement, engine: Engine

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000

    beforeAll(done => {
      appElement = document.createElement('div')
      appElement.id = 'app'
      document.body.appendChild(appElement)
      engine = testBed(i => (ctx, s) =>
        h('div', {
          hook: {
            insert: done,
          },
          on: {
            click: i.inc(ctx),
          },
        }, s.count + '')
      , viewHandler('#app'))
    })

    // afterEach(() => {
    //   document.getElementById('app').remove()
    //   if (!engine.isDisposed) {
    //     // engine.dispose()
    //   }
    // })

    it('should have initial state', () => {
      let appElm = document.getElementById('app')
      expect(appElm.children[0].textContent).toBe('0')
    })

    it('should react to input', done => {
      let expectSubscriber = vnode => {
        expect(vnode.elm.children[0].textContent).toBe('1')
        engine.interfaces['interfaceObj'].state$.unsubscribe(expectSubscriber)
        done()
      }
      engine.interfaces['interfaceObj'].state$.subscribe(expectSubscriber)
      // create and dispatch a click event
      let event = new Event('click')
      let appElm = document.getElementById('app')
      appElm.children[0].dispatchEvent(event)
    })

  })
