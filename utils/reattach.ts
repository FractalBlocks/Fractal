import { Context, ComponentSpaceIndex } from '../src'
import deepEqual = require('deep-equal')
// this function take an initial state, modified state and new state, plan diff initial and new. next apply changes to modified
export function mergeStates(ctx: Context, lastComponents: ComponentSpaceIndex) {
  for (let i = 0, ids = Object.keys(lastComponents), len = ids.length; i < len; i++) {
    // if the component still existing
    let newComp = ctx.components[ids[i]]
    /* istanbul ignore else */
    if (newComp) {
      let lastComp = lastComponents[ids[i]]
      for (let j = 0, keys = Object.keys(newComp.state), len = keys.length; j < len; j++) {
        if (deepEqual(newComp.state[keys[j]], lastComp.def.state[keys[i]])) {
          newComp.state[keys[j]] = lastComp.state[keys[j]]
        }
      }
    }
  }
}
