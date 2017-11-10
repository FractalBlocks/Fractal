import { prerender } from '../utils/aot'

import { runModule } from './module'
import * as Root from './Root/index'

prerender({
  root: Root,
  runModule,
  htmlFile: 'src/playground/aot.html',
  cssFile: 'src/playground/styles.css',
  encoding: 'utf-8', // TODO: Remove unless next Fractal version is released
  outputFile: 'src/playground/dist/index.html',
  bundlePath: 'app.js',
  cb: () => {},
})
