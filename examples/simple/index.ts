import F from '../../src'
import ViewDriver from '../../src/drivers/view'


let moduleDef = F.def({
  name: 'Main',
  init: ({key}) => ({
    key,
  }),
  interfaces: {
    view: (ctx, s) => ({
      tagName: 'div',
      content: 'Typescript is awesome!!',
    })
  },
})

F.run({
  module: moduleDef,
  drivers: {
    view: ViewDriver,
  },
})
