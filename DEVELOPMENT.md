# Development

We use BDD for building Fractal. This documents describe all about how Factal works.

## Stucture

See the reference (TODO: put a link to structure reference).

## Code conventions

We follow the Fractal Standards for Software Quality (TODO: put the link) that describes conventions for coding

## Core Dependencies

There are no dependencies for Fractal core, this has a design choice.

## Third party dependencies support

We support use of:

- Snabbdom for vdom: used in examples and view interface handlers
- Typestyle for safe styles: used in examples

## Roadmap

There are TODOs for short term:

- Example of a testForm
- Improve test suite
- Example of RTC in Fractal
- Split patch and diff in Snabbdom
- Porting all the drivers and task handlers from fractal.js to handlers in Fractal
- Deprecating fractal.js
- Larger examples
- Tutorials and videos
- Porting FractalBlocks to Fractal
- Proff of concept: Fractal-Java

There are TODOs for medium term:

- Research(experiment, observe and write) about multi-module apps
- Implement fractal-native using anvil
  - Implement flyd-java
  - Implement union-type-java
- Implement fratal-native iOS
  - Implement flyd-swift
  - Implement union-type-swift
  - Implement anvil-ios

## TODOs

What are missing for this repo:

- Cancelable callbacks from subcribables in tasks
- Update free-style dependency to version 2.0
- Document use cases on stateless components and modules
- Evaluate flatten composing
- Implement a way to compose modules in one place (@carloslfu)
- Implement a way to reattach tasks, drivers and services (@carloslfu)
- Implement CSS helpers for code reuse across objects (deep merge)
- Document granular log option for modules (@MissyM)
- Implement an example of charts (D3) (SERVICE 3PARTY-DOM-INTEGRATION)
- Implement _error task and attach it by default, this can be done all app error handling (@carloslfu)
- Implement and document serviceTest (FEATURE)
- Implement on demand large app loading example (@carloslfu)
- Implement pouchdb integration example (@carloslfu)
- Implement the Router inspired on [react-router](https://github.com/ReactTraining/react-router) (STARTED - @carloslfu)
- Implement register of modules definitions and dispose them when dispose module (MEMORY)
- Implement a way to attach disposables to module definitions
- Implement names for all the modules and examples
- Implement tests in TESTS.md and document all TODOs
- Implement an example of whole service pattern, serviceTest module and API definitions
- Implement task middleware, this allows modules to take control on module tasks (FEATURE)
- Implement ui-modules, take the button from quickstart repo
- Implement module validation and dispatch a semantic error
- Implement semantic errors via _error task
- Improve the quickstart.
- Reference tutorials whe done.
- Implement the whole library in Typescript (EVALUATE INCREMENTAL)
- Build Fractal logo in Haskell Diagrams and include source code (ELEGANT + FANCY)

## Ideas

What maybe great for this repo:

- Inputs would be disposable, this can be awesome for attachinf FRP functions to it
- Evaluate converting project into a monorepo using Lernajs
- Implement a way to load workers
- Implement a way to load service workers
- Implement a test suite
- Implement examples of test suite
- Evaluate usage of Fractal for backend and nano-micro services approach
- Explore porting Fractal to Haskell, makes sense build a DSL. A good starting point [Threepenny-gui] (https://wiki.haskell.org/Threepenny-gui) and [Haste Language](http://haste-lang.org/)
- Document integration of manifest.json for webapps
- Document of CSS tools for js and implement examples (PARTIAL)
- Implement live examples
- Implement online editor that allows live preview and hot-swaping, using: Monaco and Fractal
- Implement the forms example and document the composing tools
- Implement an i18n middleware example
- Implement examples and document the service pattern
- Implement fractalMail example using an IMAP and XMPP client, with OAuth 2.0
- Improve and update examples, are very outdated (PARTIAL IMPLEMENTED)
- Implement and document server side routing example
- screenInfo as a Global listener(middleware) // maybe deprecated?
- Improve documentation of fractal
- Fix dependencies and verify that examples works
- Improve documentation of fractal-examples
- Publish fractal-examples to github
- Implement fractal-tutorial and publish to github
- Implement ramda-mori helpers for Persistent Data Structures
- Implement an app that uses PouchDB
- Implement more examples and tutorials
- Make videotutorials and start a difusion campaign
- Put a rank function to data utils
