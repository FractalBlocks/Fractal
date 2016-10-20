import F from '../../src'


let module = F.def({
    name: 'Main',
    init: ({key}) => ({key}),
    actions: {
    },
    interfaces: {
      event: (ctx, actions, s) => ({
        tagName: s.key,
        content: 'Typescript is awesome!!',
      }),
    }
  })

  let value = undefined
  function onValue(val) {
    value = val
  }
  let engine = F.run({
    module,
    interfaces: {
      event: F.interfaces.event(onValue),
    },
  })
