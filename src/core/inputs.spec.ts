import { stateOf } from './inputs'

describe('Input functions and helpers', () => {

  describe('stateOf helper', () => {

    let lastError
    let ctx = {
      id: 'id1',
      components: {
        id1: {
          state: {},
        },
        id1$child: {
          state: {},
        },
      },
      error: (source, description) => lastError = [source, description],
    }
    let ctx2 = {
      ...ctx,
      id: 'wrong',
    }

    it('should return the component state from her context', () => {
      expect(stateOf(<any> ctx)()).toBe(ctx.components[ctx.id].state)
    })

    it('should get the state from a certain component', () => {
      let state = stateOf(<any> ctx)('child')
      expect(state).toEqual(ctx.components['id1$child'].state)
    })

    it('should log an error if there are no ctx space', () => {
      stateOf(<any> ctx2)()
      expect(lastError).toEqual(['stateOf', `there are no space 'wrong'`])
    })

    it('should log an error if there are no child space', () => {
      stateOf(<any> ctx)('wrongChild')
      expect(lastError).toEqual(['stateOf', `there are no child 'wrongChild' in space 'id1'`])
    })

  })

