import { prerender } from '../utils/aot'

import { runModule } from './module'
import * as Root from './Root/index'

prerender({
  root: Root,
  runModule,
  htmlFile: 'src/playground/aot.html',
  cssFile: 'src/playground/styles.css',
  outputFile: 'src/playground/dist/index.html',
  bundlePaths: ['app.js'],
  cb: () => {},
})
