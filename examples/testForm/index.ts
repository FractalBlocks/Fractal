import { run } from '../../src'
import { warn, error } from '../../src/utils/log'
import { viewHandler } from '../../src/interfaces/view'

let app = run({
  root: require('./app').default,
  interfaces: {
    view: viewHandler('#app'),
  },
  warn,
  error,
})

// Hot reload
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m)
  })
}
