// Pullable event bus implementation
import { Handler, EventData } from '../core'

interface Subscription {
  sub: EventData
  pullable: boolean
}

interface Subscription {
  sub: EventData
  pullable: boolean
}

interface EventSubscriptions {
  [seq: string]: Subscription
}

interface Subscriptions {
  [eventName: string]: EventSubscriptions
}

export const eventBusHandler: Handler = () => mod => {
  let state = {
    subs: <Subscriptions> {},
    subSeq: 0,
    returnFn: <any> false,
  }
  return {
    state,
    handle: async (id, [type, arg0, arg1, arg2]) => {
      if (type === '_subscribe') {
        let evName = arg0
        let evData = arg1
        let pullable = arg2 || false
        if (!state.subs[evName]) {
          state.subs[evName] = {}
        }
        let seq = state.subSeq
        state.subs[evName][seq] = {
          sub: evData,
          pullable,
        }
        state.subSeq++
        return [evName, seq]
      }
      if (type === '_unsubscribe') {
        let evName = arg0
        let seq = arg1
        delete state.subs[evName][seq]
        if (Object.keys(state.subs[evName]).length === 0) {
          // Delete empty tables
          delete state.subs[evName]
        }
        return
      }
      // A custom event have come
      let evName = type
      let data = arg0
      let evSpace = state.subs[evName]
      if (!evSpace) {
        return
      }
      setImmediate(async () => {
        let _id = id
        // Await pullable subscribers
        let results = await Promise.all(
          Object.keys(evSpace)
            .filter(seq => evSpace[seq].pullable)
            .map(seq => mod.dispatchEv([data, evName, _id], evSpace[seq].sub))
        )
        Object.keys(evSpace)
            .filter(seq => !evSpace[seq].pullable)
            .forEach(seq => {
              mod.dispatchEv([data, evName, _id], evSpace[seq].sub)
            })

        state.returnFn(results)
      })
      return await new Promise(res => {
        state.returnFn = res
      })
    },
    dispose: () => {},
  }
}
