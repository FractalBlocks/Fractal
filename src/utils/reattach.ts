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

  let ids = Object.keys(components)

  // add dynamic components to mergeable components
  for (let i = 0, lastIds = Object.keys(lastComponents), len = lastIds.length; i < len; i++) {
    if (!lastComponents[lastIds[i]].isStatic) {
      ids.push(lastIds[i])
    }
  }

  for (let i = 0, len = ids.length; i < len; i++) {
    let newComp = components[ids[i]]
    let lastComp = lastComponents[ids[i]]

    // resulting component
    comps[ids[i]] = newComp

    // if the component still existing
    if (newComp) {
      // if not is a new state of a component
      if (lastComp) {
        // if the new component state is an object
        if (typeof newComp.state === 'object') {
          for (let j = 0, keys = Object.keys(lastComp.state), len = keys.length; j < len; j++) {
            // compare old definition and new state deeply, if equal let the modified old state
            if (deepEqual(newComp.state[keys[j]], lastComp.def.state[keys[j]])) {
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
    } else { // newComp not defined
      /* istanbul ignore else */
      if (!lastComp.isStatic) {
        // add dynamic components
        comps[ids[i]] = lastComp
      }
    }
  }

  return comps
}
