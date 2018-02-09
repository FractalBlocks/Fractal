// // Pausable event bus implementation


// import { Handler, EventData } from 'fractal-core'

// interface Subscription {
//   sub: EventData
//   returnFns: {
//     [requestId: number]: { (result: any): void }
//   }
//   requestSeq: number
// }

// interface ComponentSubscriptions {
//   [componentId: string]: Subscription
// }

// interface Subscriptions {
//   [eventName: string]: ComponentSubscriptions
// }

// export const onesubscribeHandler: Handler = () => mod => {
//   let state = {
//     subs: <Subscriptions> {},
//   }
//   return {
//     state,
//     handle: async ([type, arg0, arg1]) => {
//       if (type === '_subscribe') {
//         let evName = arg0
//         let evData = arg1
//         let id = evData[0]
//         state.subs[evName][id] = {
//           sub: evData,
//           requestSeq: 0,
//           returnFns: {},
//         }
//         return
//       }
//       if (type === '_unsubscribe') {
//         let evName = arg0
//         let id = arg1
//         delete state.subs[evName][id]
//       }
//       if (type === '_return') {
//         let id = arg0
//         let seq = data[1]
//         if (!state.subs[id]) {
//           mod.error('EventBus', `There is no subscription for ${id}, dismissing returned data: ${data[2]}`)
//         }
//         state.subs[id].returnFns[seq](data[2])
//         return
//       }
//       // A custom event have come
//       let sub = state.subs[id]
//       if (!sub) {
//         mod.error('EventBus', `There is no subscription for ${id}, dismissing data: ${data}`)
//       }
//       let seq = state.subs[id].requestSeq
//       state.subs[id].requestSeq++
//       setImmediate(() => {
//         mod.dispatchEv([type, seq, data], state.subs[id].sub)
//       })
//       if (type === 'confirm') {
//         return await new Promise(res => {
//           state.returnData = res
//         })
//       }
//     },
//     dispose: () => {},
//   }
// }
