import { run } from '../../core'
import { styleHandler } from '../../groups/style'
import { viewHandler } from '../../interfaces/view'
import { logFns } from '../../log' // DEV ONLY
import { mergeStates } from '../../reattach' // DEV ONLY

let app = run({
  root: require('./app').default,
  groups: {
    style: styleHandler(),
  },
  interfaces: {
    view: viewHandler('#app'),
  },
  // DEV ONLY (you can handle it manually)
  ...logFns,
})

// Hot reload - DEV ONLY
if (module.hot) {
  module.hot.accept('./app', () => {
    let m = require('./app').default
    app.moduleAPI.reattach(m, mergeStates)
  })
}
