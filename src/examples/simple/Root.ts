import { Inputs, Actions, Interfaces, StyleGroup, clickable } from '../../core'
import { View, h } from '../../interfaces/view'

export const name = 'Main'

export const state = 0

export type S = number

export const inputs: Inputs<S> = ctx => ({
  set: async (n: number) => actions.Set(n),
  inc: async () => actions.Inc(),
})

export const actions: Actions<S> = {
  Set: n => () => n,
  Inc: () => s => s + 1,
}

const view: View<S> = ({ ctx, ev }) => s => {
  let style = ctx.groups['style']
  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    h('div', {
      class: { [style.count]: true },
      on: {
        click: ev('inc'),
      },
    }, s + ''),
    h('div', {
      class: { [style.reset]: true },
      on: {
        click: ev('set', 0),
      },
    }, 'reset'),// Por que el reset?
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


function tiempo (t) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(1000), 5000)
  })
}
async function traer () {
  let p1 = await fetch("https://jsonplaceholder.typicode.com/users/1").then(res => res.json())
  console.log(1)
  let val = await tiempo(5000)
  console.log(val)
  await tiempo(5000)
  let p2 = await fetch("https://jsonplaceholder.typicode.com/users/2").then(res => res.json())
  return [p1,p2]
}
;(async x => {
  let p1 = await fetch("https://jsonplaceholder.typicode.com/users/1").then(res => res.json())
  console.log(1)
  let val = await tiempo(5000)
  console.log(val)
  await tiempo(5000)
  let p2 = await fetch("https://jsonplaceholder.typicode.com/users/2").then(res => res.json())
  let p3 = await traer()
  return [p1,p2,p3]
})().then(x => console.log(x))





