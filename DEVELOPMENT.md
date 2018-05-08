# Development

We use BDD for building Fractal. This documents describe all about how Factal works.

## Stucture

See the reference (TODO: put a link to structure reference).

## Versioning

We follow semver.

## Design Principles

- All-in-JS: No templates, no html, no JSX, no CSS, no whatever CSS preprocessor. We simply use JS libraries and plain JS / TS:
  - TypeStyle for styles
  - Snabbdom for DOM
- TypeScript as preferred language but everything works in JS pretty well. We use TS for coding experience and catching a few bugs.
- We prefer imperative APIs and controled mutation for a more intuitive use.

Soon ... We follow the Fractal Standards for Software Quality (TODO: put the link) that describes conventions for coding

## Core Dependencies

There are no dependencies for Fractal core, this has a design choice.

## Third party dependencies

We make use of:

- Snabbdom for vdom: used in examples and view interface handlers
- Typestyle for safe styles: used in examples

## TODOs - Short Term

Shor term tasks are documented in [CHANGES Document](/CHANGES.md)

## Roadmap (What is next?)

- Complete the test suite
- Implement and document test utils
- Document component lifecycle
- OPTIMIZATION: Implement 'prepare' function for dynamic components. This allow to not reprocess styles (groups) for every component added
- Document prerendering (AOT) and SSR
- Document sizeTask
- Document Cached interfaces, this is basically that interfaces are cached by default
- Document interfaceOrder. This method is used to set the order of the initial evaluation of interfaces
- Document global events listener selfPropagated option
- Document that global and normal event listeners do not handle events that are prevented ( default: false ) and there are a listenPrevented option to reverse this behaviour
- Document that we don't support stop propagation of DOM events as a design choice because of [this article](https://css-tricks.com/dangers-stopping-event-propagation/)
- Document simple, dynamic and general propagation and it's secuential evaluation
- Document and build an example of pausing View events (global and local)
- Document and build an example of global listeners
- Document ignored and passed view event handlers
- Flux-Challenge example and do a PR to Staltz repo (WIP)
- Todo-mvc example in a separated repo
- Implement an example of charts (D3) (SERVICE 3PARTY-DOM-INTEGRATION)
- Evaluate if multiple handlers in an element are an ati-pattern, if so deprecate it
- Change examples for the way we import components as router example does, note that hot-swaping changes too
- Add error index (DX)
- Cancelable callbacks from subcribables in tasks, via an instance index
- Router Docs (ASAP)
- Simplify toHTML function and remove lodash stuff (CRITICAL - Introduced as a hotfix for toHTML function)
- Example of RTC in Fractal
- Official support for [Popmotion](https://github.com/Popmotion/popmotion) as an optional animation library
- Split patch and diff in Snabbdom
- Porting all the drivers and task handlers from fractal.js to handlers in Fractal

## Ideas

What maybe great for this repo:

- Implement the forms example and document the composing tools
- Implement an i18n middleware example
- Implement ramda-mori helpers for Persistent Data Structures
- Upgrate old Fractal examples and publish them
