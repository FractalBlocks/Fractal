import { Inputs, Actions, ev, Interfaces } from '../../core'
import { StyleGroup, clickable } from '../../style'
import { View } from '../../interfaces/view'
import h from 'snabbdom/h'

export const name = 'Main'

export const state = 0

export type S = number

export const inputs: Inputs<S> = ctx => ({
  set: (n: number) => actions.Set(n),
  inc: () => actions.Inc(),
})

export const actions: Actions<S> = {
  Set: n => () => n,
  Inc: () => s => s + 1,
}

const view: View<S> = (ctx, s) => {
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
    }, s + ''),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev(ctx, 'set', 0),
      },
    }, 'reset'),
  ])
}

export const interfaces: Interfaces = { view }

const style: StyleGroup = {
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

export const groups = { style }
