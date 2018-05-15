
import * as forOwn from 'lodash.forown'
import * as escape from 'lodash.escape'

// data.attrs

module.exports = function attrsModule (vnode, attributes) {
  var attrs = vnode.data.attrs || {}

  forOwn(attrs, function (value, key) {
    attributes.set(key, escape(value))
  })
}
