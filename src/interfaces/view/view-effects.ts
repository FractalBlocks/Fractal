// import { Handler, Context } from '../core'
// import { init } from 'snabbdom'
// import classModule from 'snabbdom/modules/class'
// import attributesModule from 'snabbdom/modules/attributes'
// import propsModule from 'snabbdom/modules/props'
// import eventlistenersModule from './viewEventlisteners'
// import styleModule from 'snabbdom/modules/style'
// import h from 'snabbdom/h'
// import { VNode } from 'snabbdom/vnode'

// export interface ViewInterface {
//   (ctx: Context, s): VNode
// }

// export const viewHandler: Handler = selectorElm => mod => {
//   let selector = (typeof selectorElm === 'string') ? selectorElm : ''
//   let lastContainer
//   let state

//   // Common snabbdom patch function (convention over configuration)
//   let patchFn = init([
//     classModule,
//     attributesModule,
//     propsModule,
//     eventlistenersModule(mod),
//     styleModule,
//   ])

//   function wraperPatch (o, n) {
//     let newContainer = patchFn(o, n)
//     lastContainer = newContainer
//     return newContainer
//   }

//   function handler (vnode: VNode) {
//     let vnode_mapped = h('div' + selector, { key: selector }, [vnode])
//     state = wraperPatch(state, vnode_mapped)
//   }

//   return {
//     state,
//     handle: (value: VNode) => {
//       if (!state) {
//         let container = selector !== '' ? document.querySelector(selector) : selectorElm
//         if (!container) {
//           return mod.error('view', `There are no element matching selector '${selector}'`)
//         }
//         state = container
//         handler(state)
//         handler(value)
//       } else {
//         handler(value)
//       }
//     },
//     dispose: () => {},
//   }
// }
