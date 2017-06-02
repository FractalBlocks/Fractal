import { Inputs, Actions, Interfaces, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'
import { hashMap } from 'mori'
import { evolve, get } from '../../utils/mori'

export const name = 'Main'

export const state: any = hashMap<string, string>(
  'count', 0,
)

export const  actions: Actions<any> = {
  Set: (count: number) => evolve('count', () => count),
  Inc: () => evolve('count', x => x + 1),
}

export const  inputs: Inputs<any> = ctx => ({
  set: n => actions.Set(n),
  inc: () => actions.Inc(),
})

let view: View<any> = ({ ctx, ev }) => s => {
  let style = ctx.groups['style']
  return h('div', {
    key: get(s, 'key'),
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev('inc'),
      },
    }, `${get(s, 'count')}`),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev('set', 0),
      },
    }, 'reset'),
  ])
}

export const interfaces: Interfaces = { view }

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

export const groups = { style }
