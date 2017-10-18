import './styles.css'
import { runModule } from './module'
import './hmr'

import * as root from './Root'

let DEV = process.env.ENV === 'development'

;(async () => {

  const app = await runModule(root, DEV)
  ;(window as any).app = app

})()
