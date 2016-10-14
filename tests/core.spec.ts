import F from '../src'

describe('Engine functionality', function() {

  let module = F.def({
    name: 'Main',
    init: ({key}) => ({key}),
    interfaces: {
      view: (ctx, s) => ({
        tagName: 'div',
        content: 'Typescript is awesome!!',
      }),
    }
  })

  let engine = F.run({
    module,
    drivers: {
      view: F.drivers.view
    }
  })

  it('Should have initial state', function() {
    expect(module.state.key).toBe('Main')
  })
})
