
import forOwn = require('lodash.forown')
import escape = require('lodash.escape')

// data.attrs

module.exports = function attrsModule (vnode, attributes) {
  var attrs = vnode.data.attrs || {}

  forOwn(attrs, function (value, key) {
    attributes.set(key, escape(value))
  })
}
