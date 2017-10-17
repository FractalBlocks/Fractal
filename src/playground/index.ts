import './styles.css'
import { runModule } from './module'
import './hmr'

import * as root from './Root'

let DEV = process.env.ENV === 'development'

;(async () => {

  const app = await runModule(root, DEV)
  // setInterval(() => {
  //   app.moduleAPI.dispatch(['Root', 'inputKeyup', _, [13, 'asdasd'], 'fn'])
  // })
  ;(window as any).app = app

})()
