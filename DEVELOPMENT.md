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

## Roadmap

There are TODOs for short term:

- Update examples that uses global child listeners acording to v1.2.0 changes
- Change examples for the way we import components as router example does, note that hot-swaping changes too
- Add error index (DX)
- Router Docs (ASAP)
- Asyncronous handling of groups, Fix styles in worker example (Fixes worker support)
- Official support for [Popmotion](https://github.com/Popmotion/popmotion) as an optional animation library
- Build an example of Scuttlebott integration (ASAP)
- Use complexList inside manyLists example and add adapter to complexList
- Document adapters like a way for nesting complex lists (dynamic component trees)
- Improve the complexList (AKA add more behavior)
- Document `Actions<typeof state>`
- Refactor examples to make use of typesafe actions
- Example of lazy loading
- Timetravel debugging
- TESTING: Test propagation / nested propagation of component message interchange
- Integrate standard linter + trailing commas with tslint
- Improve test suite with isolated tests
- Example of RTC in Fractal
- Split patch and diff in Snabbdom
- Porting all the drivers and task handlers from fractal.js to handlers in Fractal
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

- Cancelable callbacks from subcribables in tasks, via an instance index
- Document use cases on stateless components and modules
- Implement an example of charts (D3) (SERVICE 3PARTY-DOM-INTEGRATION)
- Implement on demand large app loading example (@carloslfu)
- Implement pouchdb integration example (@carloslfu)
- Implement an example of whole service pattern, serviceTest module and API definitions
- Implement ui-modules as an example of setting-up an own design framework for an app, take the button from quickstart repo
- Reference tutorials whe done.
- Build Fractal logo in Haskell Diagrams and include source code (FANCY)

## Ideas

What maybe great for this repo:

- Evaluate usage of Fractal for backend and nano-micro services approach
- Explore porting Fractal to Haskell, makes sense build a DSL. A good starting point [Threepenny-gui] (https://wiki.haskell.org/Threepenny-gui) and [Haste Language](http://haste-lang.org/)
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
