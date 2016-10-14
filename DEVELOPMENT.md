# Development

We use BDD for building Fractal. This documents describe all about how Factal works.

## Stucture

(TODO-DOCS)

## Code conventions

We use UpperCamelCase for types and LowerCamelCase for values (functions are values) (TODO-DOCS)

## Dependencies

The folowing are the dependencies of Fractal:

(TODO-DOCS)

Deprecated, Fractal.js stuff:

- flyd: FRP tools (Replaced by src/stream.ts)
- flyd-forwardto: flyd module
- union-type: A library for defining and using union types (AKA disjoint unions)
- addressbar: Used in Fractal Router
- url-mapper: Used in Fractal Router
- deep-diff: Used in F.log module
- mori: Persistent data sturctures with a functional API, will be part of Fractal when ramda-mori in utils are complete
- ramda: A library for functional programming, we remove that dep when ramda-mori in utils are complete
- snabbdom: Virtual DOM library used in View driver
- free-style: Used for css tools, is a good solution for CSS in JS
