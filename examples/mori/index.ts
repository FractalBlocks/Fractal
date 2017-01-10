import { run } from '../../src'
import { viewHandler } from '../../src/interfaces/view'


let engine = run({
  module: require('./app').default,
  interfaces: {
    view: viewHandler('#app'),
  }
})


// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    engine.reattach(m)
  })
}
