
import { init } from './init'
import modules from './modules'

var toHTML = init([
  modules.attributes,
  modules.props,
  modules.class,
  modules.style
])

export default toHTML
