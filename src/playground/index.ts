import './styles.css'
import { runModule } from './module'
import './hmr'

import * as root from './Root'
import { sendMsg } from '../core/index';

let DEV = process.env.ENV === 'development'

;(async () => {

  const app = await runModule(root, DEV)
  ;(window as any).test = () => {
    let count = 1
    let interval = setInterval(async () => {
      sendMsg(app, 'Root$List', 'inputKeyup', [45, 'iteration ' + count])
      sendMsg(app, 'Root$List', 'inputKeyup', [13, 'iteration - ' + count])
      count++
      if (count === 300) {
        clearInterval(interval)
      }
    })
  }
  ;(window as any).app = app

})()
