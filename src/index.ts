import core from './core'
import eventDriver from './drivers/event'
import viewDriver from './drivers/view'

export default Object.assign(
  core,
{
  drivers: {
    event: eventDriver,
    view: viewDriver,
  },
})
