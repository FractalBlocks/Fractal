import core from './core'
import viewDriver from './drivers/view'

export default Object.assign(
  core,
{
  drivers: {
    view: viewDriver,
  },
})
