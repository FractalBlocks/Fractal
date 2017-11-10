import { prerender } from '../utils/aot'

import { runModule } from './module'
import * as Root from './Root/index'

prerender({
  htmlFile: 'src/playground/aot.html',
  cssFile: 'src/playground/styles.css',
  outputFile: 'src/playground/dist/index.html',
}, {
  root: Root,
  runModule,
  bundlePaths: ['app.js'],
  cb: async () => {},
})
