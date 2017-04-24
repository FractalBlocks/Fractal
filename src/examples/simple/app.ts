import { Inputs, Actions, Component, ev } from '../../core'
import { StyleGroup, clickable } from '../../style'
import { View } from '../../interfaces/view'
import { assoc, evolveKey } from '../../fun'
import h from 'snabbdom/h'

let name = 'Main'

export const state = {
  count: 0,
}

export type S = typeof state

let inputs: Inputs<S> = ctx => ({
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
})

let actions: Actions<S> = {
  Set: assoc('count'),
  Inc: () => evolveKey('count')(x => x + 1),
}

let view: View<S> = (ctx, s) => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev(ctx, 'inc'),
      },
    }, `${s.count}`),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev(ctx, 'set', 0),
      },
    }, 'reset'),
  ])
}

let style: StyleGroup = {
  base: {
    width: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#C1C6CC',
  },
  count: {
    width: '30px',
    height: '30px',
    marginRight: '10px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    backgroundColor: '#3232F2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...clickable,
  },
  reset: {
    padding: '4px',
    color: 'white',
    fontSize: '18px',
    backgroundColor: '#EA1818',
    ...clickable,
  },
}

let mDef: Component<S> = {
  name,
  groups: {
    style,
  },
  state,
  inputs,
  actions,
  interfaces: {
    view,
  },
}

export default mDef

