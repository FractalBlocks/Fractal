// VALIDATED (all conf file with this tag are not pending of deprecation)

// Based on AngularClass starter setup for angular 2 and webpack

Error.stackTraceLimit = Infinity

require('core-js/es6')
require('core-js/es7/reflect')

// Typescript emit helpers polyfill
require('ts-helpers')

var testContext = require.context('../src', true, /\.spec\.ts/)

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext)
}

var modules = requireAll(testContext)
