import core from './core'
import eventDriver from './interfaces/event'
// import viewDriver from './interfaces/view'

export default Object.assign(
  core,
{
  interfaces: {
    event: eventDriver,
    // view: viewDriver,
  },
})
