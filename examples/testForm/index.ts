import { run } from '../../src'
import { warn, error } from '../../utils/log'
import { mergeStates } from '../../utils/reattach'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'

let app = run({
  root: require('./app').default,
  groups: {
    style: styleHandler('app-style'),
  },
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
    app.moduleAPI.reattach(m, mergeStates)
  })
}
