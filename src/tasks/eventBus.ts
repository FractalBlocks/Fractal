// Pullable event bus implementation
import { Handler, EventData } from '../core'

interface Subscription {
  sub: EventData
  pullable: boolean
}

interface ComponentSubscriptions {
  [componentId: string]: Subscription
}

interface Subscriptions {
  [eventName: string]: ComponentSubscriptions
}

export const eventBusHandler: Handler = () => mod => {
  let state = {
    subs: <Subscriptions> {},
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
        state.subs[evName][id] = {
          sub: evData,
          pullable,
        }
        return
      }
      if (type === '_unsubscribe') {
        let evName = arg0
        let id = arg1
        delete state.subs[evName][id]
      }
      // A custom event have come
      let evName = type
      let data = arg0
      let evSpace = state.subs[evName]
      if (!evSpace) {
        mod.error('EventBus', `There is no subscription for event '${evName}' dispatched from '${id}', dismissing data: ${data}`)
      }
      setImmediate(async () => {
        let _id = id
        // Await pullable subscribers
        let results = await Promise.all(
          Object.keys(evSpace)
            .filter(compId => evSpace[compId].pullable)
            .map(compId => mod.dispatchEv([data, evName, _id], evSpace[compId].sub))
        )
        Object.keys(evSpace)
            .filter(compId => !evSpace[compId].pullable)
            .forEach(compId => {
              mod.dispatchEv([data, evName, _id], evSpace[compId].sub)
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
