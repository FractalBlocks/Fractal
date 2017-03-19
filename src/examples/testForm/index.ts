import { run } from '../../core'
import { viewHandler } from '../../interfaces/view'
import { styleHandler } from '../../groups/style'
import { onDispatch, warn, error } from '../../utils/log' // DEV ONLY
import { mergeStates } from '../../utils/reattach' // DEV ONLY

let app = run({
  root: require('./app').default,
  groups: {
    style: styleHandler('app-style', true),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  onDispatch,
  warn, // warn and error can be used for bug reporting
  error,
})

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m, mergeStates)
  })
}
