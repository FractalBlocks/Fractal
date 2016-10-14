import F from '../src'

describe('Core functionality', function() {

  let module = F.def({
    name: 'Main',
    init: ({key}) => ({key}),
    interfaces: {}
  })

  it('Should have initial state', function() {
    expect(module.state.key).toBe('MainModule')
  })
})
