import { run } from '../core'
import { moduleDef } from './module'
import { runWorker } from '../utils/worker'

// TODO: make this variable dynamic, implement a toggle button for that
const runInWorker = true

if (runInWorker) {
  // Running Fractal in a worker thread
  runWorker({
    worker: new Worker('worker.js'),
    ...moduleDef,
  })
} else {
  // Running Fractal in the main thread
  run(moduleDef)
}

