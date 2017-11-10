# Development

We use BDD for building Fractal. This documents describe all about how Factal works.

## Stucture

See the reference (TODO: put a link to structure reference).

## Versioning

We follow semver.

## Code conventions

We follow the Fractal Standards for Software Quality (TODO: put the link) that describes conventions for coding

## Core Dependencies

There are no dependencies for Fractal core, this has a design choice.

## Third party dependencies support

We support use of:

- Snabbdom for vdom: used in examples and view interface handlers
- Typestyle for safe styles: used in examples

## Roadmap (What is next?)

There are TODOs for short term:

- Simplify tests (would be reimplement it? most tests are disabled right now)
- Document component lifecycle
- Introduce a template language for AOT / SSR
- OPTIMIZATION: Implement 'prepare' function for dynamic components. This allow to not reprocess styles (groups) for every component added
- Document prerendering (AOT) and SSR
- Remove lodash stuff (CRITICAL - Introduced as a hotfix for toHTML function)
- Simplify toHTML function
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
- Start prototyping of core implementation in WebAssembly (ASAP)
- Flux-Challenge example and do a PR to Staltz repo (WIP)
- Todo-mvc example in a separated repo
- Asyncronous handling of groups, Fix styles in worker example (Fixes worker support)
- Change examples for the way we import components as router example does, note that hot-swaping changes too
- Evaluate a way for keeping state in inputs, maybe support use of generators e.g. keep waiting for 3 messages after execute some action or task
- Add error index (DX)
- Router Docs (ASAP)
- Build an example of Scuttlebott integration (ASAP)
- Use complexList inside manyLists example and add adapter to complexList
- Document adapters like a way for nesting complex lists (dynamic component trees)
- Refactor examples to make use of typesafe actions
- Timetravel debugging
- Example of lazy loading
- Official support for [Popmotion](https://github.com/Popmotion/popmotion) as an optional animation library
- Integrate standard linter + trailing commas with tslint
- Improve test suite with isolated tests
- Example of RTC in Fractal
- Split patch and diff in Snabbdom
- Porting all the drivers and task handlers from fractal.js to handlers in Fractal
- Larger examples
- Tutorials and videos
- Proff of concept: Fractal-Java

There are TODOs for medium term:

- Research(experiment, observe and write) about multi-module apps
- Implement fractal-native using anvil
- Implement fractal-native iOS
  - Implement anvil-ios, Note that we can use [PortalView](https://github.com/guidomb/PortalView)

## TODOs

What are missing for this repo:

- Cancelable callbacks from subcribables in tasks, via an instance index
- Document use cases on stateless components and modules
- Implement an example of charts (D3) (SERVICE 3PARTY-DOM-INTEGRATION)
- Implement on demand large app loading example (@carloslfu)
- Implement pouchdb integration example (@carloslfu)
- Implement an example of whole service pattern, serviceTest module and API definitions
- Implement ui-modules as an example of setting-up an own design framework for an app, take the button from quickstart repo

## Ideas

What maybe great for this repo:

- Build Fractal logo in Haskell Diagrams and include source code (FANCY)
- Evaluate usage of Fractal for backend and nano-micro services approach
- Document integration of manifest.json for webapps
- Implement live examples
- Implement online editor that allows live preview and hot-swaping, using: Monaco and Fractal
- Implement the forms example and document the composing tools
- Implement an i18n middleware example
- Implement examples and document the service pattern
- Implement fractalMail example using an IMAP and XMPP client, with OAuth 2.0
- Implement and document server side routing example
- Improve documentation of fractal
- Improve documentation of fractal-examples
- Publish fractal-examples to github
- Implement fractal-tutorial and publish to github
- Implement ramda-mori helpers for Persistent Data Structures
- Implement an app that uses PouchDB
- Implement more examples and tutorials
- Make videotutorials and start a difusion campaign
- Put a rank function to data utils
- Explore porting Fractal to Haskell, makes sense build a DSL. A good starting point [Threepenny-gui] (https://wiki.haskell.org/Threepenny-gui) and [Haste Language](http://haste-lang.org/)
