import { ComponentSpaceIndex } from '../core'
import deepEqual = require('deep-equal')

/* this function take an initial state, modified state and new state
  make a plan diff of initial and new. next apply changes to modified
*/
export function mergeStates (
  components: ComponentSpaceIndex, // new components
  lastComponents: ComponentSpaceIndex // old components
): ComponentSpaceIndex {

  let comps: ComponentSpaceIndex = {}

  for (let i = 0, ids = Object.keys(lastComponents), len = ids.length; i < len; i++) {
    let newComp = components[ids[i]]
    let lastComp = lastComponents[ids[i]]

    // resulting component
    comps[ids[i]] = newComp

    // if the component still existing
    /* istanbul ignore else */
    if (newComp) {
      // if the new component state is an object
      if (typeof newComp.state === 'object') {
        for (let j = 0, keys = Object.keys(newComp.state), len = keys.length; j < len; j++) {
          // compare old definition and new state deeply, if equal let the modified old state
          if (deepEqual(newComp.state[keys[j]], lastComp.def.state[keys[i]])) {
            comps[ids[i]].state[keys[j]] = lastComp.state[keys[j]]
          }
        }
      } else { // if is a value or undefined
        /* istanbul ignore else */
        if (newComp.state === lastComp.def.state) {
          comps[ids[i]].state = lastComp.state
        }
      }
    }
  }

  return comps
}
