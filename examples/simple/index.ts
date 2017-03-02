import { run } from '../../src'
import { viewHandler } from '../../interfaces/view'

let app = run({
  root: require('./app').default,
  interfaces: {
    view: viewHandler('#app'),
  }
})

// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m)
  })
}
