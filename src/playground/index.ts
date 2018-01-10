import './styles.css'
import { runModule } from './module'
import './hmr'

import * as Root from './Root'

let DEV = process.env.ENV === 'development'

;(async () => {

  const app = await runModule(Root, DEV)
  ;(window as any).app = app

  // For testing purposes
  // ;(window as any).test = () => {
  //   let count = 1
  //   let interval = setInterval(async () => {
  //     await sendMsg(app, 'Root$List', 'inputKeyup', [13, 'iteration - ' + count])
  //     count++
  //     if (count === 50) {
  //       clearInterval(interval)
  //     }
  //   })
  // }

})()
