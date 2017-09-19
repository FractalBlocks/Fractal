import { ComponentSpaceIndex, Context } from '../core'
import deepEqual = require('deep-equal')

/* this function take an initial state, modified state and new state
  make a plan diff of initial and new. next apply changes to modified
*/
// export function mergeStates (
//   ctx: Context,
//   components: ComponentSpaceIndex, // new components
//   lastComponents: ComponentSpaceIndex // old components
// ): ComponentSpaceIndex {

//   let comps: ComponentSpaceIndex = {}

//   let ids = Object.keys(components)

//   // add dynamic components to mergeable components
//   let id
//   for (id in lastComponents) {
//     if (!lastComponents[id].isStatic) {
//       ids.push(id)
//     }
//   }

//   for (let i = 0, len = ids.length; i < len; i++) {
//     let newComp = components[ids[i]]
//     let lastComp = lastComponents[ids[i]]

//     // resulting component
//     comps[ids[i]] = newComp

//     // if the component still existing
//     if (newComp) {
//       // if not is a new state of a component
//       if (lastComp) {
//         // if the new component state is an object
//         if (typeof newComp.state === 'object') {
//           for (let j = 0, keys = Object.keys(lastComp.state), len = keys.length; j < len; j++) {
//             // compare old definition and new state deeply, if equal let the modified old state
//             if (deepEqual(newComp.state[keys[j]], lastComp.def.state[keys[j]])) {
//               comps[ids[i]].state[keys[j]] = lastComp.state[keys[j]]
//             }
//           }
//         } else { // if is a value or undefined
//           /* istanbul ignore else */
//           if (newComp.state === lastComp.def.state) {
//             comps[ids[i]].state = lastComp.state
//           }
//         }
//       }
//     } else { // newComp not defined
//       /* istanbul ignore else */
//       if (!lastComp.isStatic) {
//         // add dynamic components
//         comps[ids[i]] = lastComp
//       }
//     }
//   }

//   for (id in comps) {
//     // replace component in contexts of spaces
//     comps[id].ctx.components = comps
//     if (!comps[id].isStatic) {
//       // replace outdated defs of dynamic components
//       let idParts = id.split('$')
//       // is not root?
//       /* istanbul ignore else */
//       if (idParts.length > 1) {
//         let parentId = idParts.slice(0, -1).join('$')
//         if (components[parentId]) {
//           if (components[parentId].def.defs && components[parentId].def.defs[comps[id].def.name]) {
//             comps[id].def = components[parentId].def.defs[comps[id].def.name]
//           } else {
//             ctx.error('mergeStates', `there are no dynamic component definition of ${comps[id].def.name} (defs) in ${parentId}`)
//           }
//         } else {
//           if (comps[parentId].def.defs && comps[parentId].def.defs[comps[id].def.name]) {
//             comps[id].def = comps[parentId].def.defs[comps[id].def.name]
//           } else {
//             ctx.error('mergeStates', `there are no dynamic component definition of ${comps[id].def.name} (defs) in ${parentId}`)
//           }
//         }
//       }
//     } else {

//     }
//   }

//   return comps
// }


export function mergeStates (
  ctx: Context,
  components: ComponentSpaceIndex, // new components
  lastComponents: ComponentSpaceIndex // old components
): ComponentSpaceIndex {



  let comps: ComponentSpaceIndex = {}

  let ids = Object.keys(components)

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
      comps[ids[i]] = lastComp
    }
  }

  // Dynamic reconciliation
  // let dynamicIds = []
  let id
  for (id in lastComponents) {
    if (!lastComponents[id].isStatic) {
      // D desc (S1 - S0)
      let idParts = id.split('$')
      let parentId = idParts.slice(0, -1).join('$')
      if (components[parentId]) {

        comps[id] = lastComponents[id]
      }
      // dynamicIds.push(id)
    }
  }



  return comps
}

