import { ComponentSpaceIndex, Context, ComponentSpace } from '../core'
import deepEqual = require('deep-equal')

/* this function take an initial state, modified state and new state
  make a plan diff of initial and new. next apply changes to modified
*/
export function mergeComponents (
  ctx: Context,
  components: ComponentSpaceIndex, // new components
  lastComponents: ComponentSpaceIndex // old components
): ComponentSpaceIndex {

  let comps: ComponentSpaceIndex = {}

  let ids = Object.keys(components)

  // add dynamic components to mergeable components
  let id
  for (id in lastComponents) {
    if (!lastComponents[id].isStatic) {
      ids.push(id)
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
        mergeStates(comps[ids[i]], newComp, lastComp)
      }
    } else { // newComp not defined
      /* istanbul ignore else */
      if (!lastComp.isStatic) {
        // add dynamic components
        comps[ids[i]] = lastComp
      }
    }
  }

  for (id in comps) {
    // replace component in contexts of spaces
    comps[id].ctx.components = comps
    if (!comps[id].isStatic) {
      // replace outdated defs of dynamic components
      let idParts = id.split('$')
      // is not root?
      /* istanbul ignore else */
      if (idParts.length > 1) {
        let parentId = idParts.slice(0, -1).join('$')
        if (comps[parentId]) {
          if (lastComponents[parentId] && lastComponents[parentId].def.defs && lastComponents[parentId].def.defs[comps[id].def.name]) {
            let def = lastComponents[parentId].def.defs[comps[id].def.name]
            comps[id].def = def
            mergeStates(comps[id], def, lastComponents[id])
          } else {
            ctx.error('mergeStates', `there are no dynamic component definition of ${comps[id].def.name} (defs) in ${parentId}`)
          }
        }
      }
    }
  }

  return comps
}

export function mergeStates (comp: ComponentSpace, newComp: { state?: any }, lastComp: ComponentSpace) {
  // if the new component state is an object
  if (typeof newComp.state === 'object') {
    for (let j = 0, keys = Object.keys(lastComp.state), len = keys.length; j < len; j++) {
      // compare old definition and new state deeply, if equal let the modified old state
      if (deepEqual(newComp.state[keys[j]], lastComp.def.state[keys[j]])) {
        comp.state[keys[j]] = lastComp.state[keys[j]]
      }
    }
  } else { // if is a value or undefined
    /* istanbul ignore else */
    if (newComp.state === lastComp.def.state) {
      comp.state = lastComp.state
    }
  }
}
