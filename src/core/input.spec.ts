// import { _stateOf, toChild, toAct } from './input'
// import { run } from './module'
// import { Component } from './core'

// describe('Input functions and helpers', () => {

//   describe('stateOf helper', () => {

//     let lastError
//     let ctx = {
//       id: 'id1',
//       components: {
//         id1: {
//           state: {},
//         },
//         id1$child: {
//           state: {},
//         },
//       },
//       error: (source, description) => lastError = [source, description],
//     }
//     let ctx2 = {
//       ...ctx,
//       id: 'wrong',
//     }

//     it('should return the component state from her context', () => {
//       expect(_stateOf(<any> ctx)()).toBe(ctx.components[ctx.id].state)
//     })

//     it('should get the state from a certain component', () => {
//       let state = _stateOf(<any> ctx)('child')
//       expect(state).toEqual(ctx.components['id1$child'].state)
//     })

//     it('should log an error if there are no ctx space', () => {
//       _stateOf(<any> ctx2)()
//       expect(lastError).toEqual(['stateOf', `there are no space 'wrong'`])
//     })

//     it('should log an error if there are no child space', () => {
//       _stateOf(<any> ctx)('wrongChild')
//       expect(lastError).toEqual(['stateOf', `there are no child 'wrongChild' in space 'id1'`])
//     })

//   })

//   describe('toChild function', async () => {
//     let childData
//     let Child: Component<any> = {
//       name: 'Child',
//       state: {
//         count: 0,
//         data: 10,
//       },
//       inputs: ctx => ({
//         childInput: async data => {
//           childData = data
//         },
//       }),
//       actions: {},
//       interfaces: {},
//     }
//     let root: Component<any> = {
//       name: 'Root',
//       components: {
//         Child,
//       },
//       state: {},
//       inputs: ctx => ({}),
//       actions: {},
//       interfaces: {},
//     }
//     let error
//     let app = await run({
//       root,
//       interfaces: {},
//       error: (source, description) => error = [source, description],
//     })

//     it ('should send a message to a child component from the parent correctly', () => {
//       let data1 = 129
//       let data2 = 129
//       toChild(app.ctx.components['Root'].ctx)('Child', 'childInput', data1)
//       expect(childData).toEqual(data1)
//       toChild(app.ctx.components['Root'].ctx)('Child', 'childInput', data2, false, true)
//       expect(childData).toEqual(data2)
//     })

//     it ('should send an undefined message to a child component from the parent correctly', () => {
//       toChild(app.ctx.components['Root'].ctx)('Child', 'childInput')
//       expect(childData).toEqual(undefined)
//     })

//     it ('should log an error when there is no child', () => {
//       toChild(app.ctx.components['Root'].ctx)('Wrong', 'childInput')
//       expect(error).toEqual(['toChild', `there are no child 'Wrong' in space 'Root'`])
//     })

//   })


//   describe('Generic action self call', async () => {
//     let actionData
//     let root: Component<any> = {
//       name: 'MyComp',
//       state: 0,
//       inputs: ctx => ({
//       }),
//       actions: {
//         Name: data => s => {
//           actionData = data
//           return s
//         },
//       },
//       interfaces: {},
//     }
//     let app = await run({
//       root,
//       interfaces: {},
//     })

//     it('should call input with the action name and data', async () => {
//       await toAct(app.ctx.components.MyComp.ctx)('Name', 'data1')
//       expect(actionData).toEqual('data1')
//       await toAct(app.ctx.components.MyComp.ctx)('Name', 'data2', true)
//       expect(actionData).toEqual('data2')
//     })

//   })

// })
