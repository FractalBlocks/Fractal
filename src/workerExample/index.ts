import { runWorker, run } from '../core'
import { moduleDef } from './module'

// TODO: make this variable dynamic, implement a toggle button for that
const runInWorker = true

if (runInWorker) {
  // Running Fractal in a worker thread
  runWorker({
    Root: 'in-worker', // no matter what you put here ;) because Root component is imported inside the worker
    worker: new Worker('worker.js'),
    ...moduleDef,
  })
} else {
  // Running Fractal in the main thread
  run(moduleDef)
}

