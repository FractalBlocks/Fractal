# Changes

# Changes for Fractal core

# Next

- Add error message when toChild is executed with an invalid child name

## Done

# v2.1.1

- Remove mori helpers from core

# v2.1.0

- Ignore log.ts and style.ts coverage for now
- Remove cs() unused function from style.ts
- Due to Webpack 2 has tree shaking and is the desired build tool, we should have one import for all the core functions, migration all helpers to core index

# v2.0.4

- Fix input import in core.ts
- Fix input import in log.ts

# v2.0.3

- Fix dependencies from input refactor
- Add input to core (fix)
- Rename inputs for input

# v2.0.2

- Fix CtxNest type signature and worker.ts

# v2.0.1

- Add stateOf to interface helpers

# v2.0.0

- Add stateOf, toIt, toChild, nest, unnest, nestAll and unnestAll to input helpers and curry them
- Group all input helpers to inputs.ts
- Interface ctx argument replaced by helpers object, increase redability and speed
- Currying all the interface helpers and group on interface.ts
- Add an interface index to ComponentSpace increasing speed
- Inputs ctx argument replaced by input helpers object
- Currying interfaces for optimize speed
- Fix logging stuff in globalListeners

# v1.6.0

- toParent has removed because enforce coupling of components
- act has new signature
- Add toAct helper

# v1.5.6

- Global listeners are attached to main container

# v1.5.5

- Fix bug related to global-local listeners

# v1.5.4

- Event options are optional in core interface

# v1.5.3

- Fix bad npm upload

# v1.5.2

- Add options parameter to event listeners at Fractal core, with `default` and `propagate` options

# v1.5.1

- View event listeners can control preventDefault and stopPropagation via context data _default and _propagate properties

# v1.5.0

- Add global events handler to view interface

# v1.4.13

- Component init hooks are executed after first `notifyInterfaceHandlers`
- Add Components type to components parameter of nest function

# v1.4.12

- Add VNode to View interface exports

# v1.4.11

- Rename `merge` core function to `nest`

# v1.4.10

- Fix type signature of `assoc` functional helper

# v1.4.9

- Fix build

# v1.4.8

- Refactor view interface file structure
- Include h as a view method
- Include vnode into core view methods

# v1.4.7

- Add ignore to On interface for event handlers

# v1.4.6

- Update snabbdom version
- Implement VNodeData and other stuff for h types
- Add `interfaces/h` for using without import snabbdom

# v1.4.5

- Fix view event listeners snabbdom module event pausing

# v1.4.4

- Add merge to functional utils fun.ts

# v1.4.3

- Fix execute function
- Move toIt to core

# v1.4.2

- Fix log when state is not an object

# v1.4.1

- Fix log functions

# v1.4.0

- Add isPropagated optional parameter to dispatch function
- Refactor and simplify API
- Remove onDispatch event from Module and log helpers
- Add beforeInput and afterInput events to Context and Module
- Better Logging functions

# v1.3.1

- Speed up core replacing for-Object.keys loop by for-in
- Message Interchange fuctions propagation is optional, true by default

# v1.3.0

- Remove useless parameter from `execute` function
- Remove useless parameter from `propagate` function

# v1.2.1

- Fix nested propagation

# v1.2.0

- Fix component message interchange by adding propagation
- Add scope to global component listeners (parent -child communication)

# v1.1.0

- Add functional utils to `fun.ts`
- Add assoc, evolve and evolveKey function to fun utils
- Add type Interface<Type, S> and refactor View type in View interface
- Relocate utils to root folder (src)

# v1.0.8

- Parent can observe any child input

# v1.0.7

- Make msg parameter of sendMsg and toIt optional in utils/component

# v1.0.6

- Add ignore and pass options to view event handlers

# v1.0.5

- Add event stoping in view event handlers

# v1.0.4

- Add ignored view event listeners

# v1.0.3

- Fix bug in dispatch

# v1.0.2

- Fix some types to be useful

# v1.0.1

- Add functional utils (fun) with pipe and mapToObj and remove them from component utils

# v1.0.0 :rose:

- Allow use `Actions<typeof state>` for typesafe actions (BREAKING CHANGE)
- Create Id type that can be Number | String, for avoid using <any> in dynamic components
- Update examples

# v0.7.7

- Add toIt helper for sending messages to the same component
- toChild log an error when child does not have the input

# v0.7.6

- toParent helper log an error when parent does not handle child messages

# v0.7.5

- Improve implementation of child -> parent communication via toParent for better performance and clarity

# v0.7.4

- Add stateOf name parameter for fixing API
- Add clickable style helper
- Improve update examples

# v0.7.3

- Fix broken stuff after removing core/stateOf

# v0.7.2

- Remove core/stateOf duplicated method

# v0.7.1

- Fix bug with notifyHandlers

# v0.7.0

- Add sendMsg and toChild function to component helpers for better messaging
- Fix a test and coverage in worker helpers

# v0.6.8

- Add fetch value option for generic inputs

# v0.6.7

- Fix edge case with child components with dynamic parents

# v0.6.6

- Fix error with reattach when parent component don't have defs

# v0.6.5

- Add error when component defs of a parent does not have definition of a dynamic component

# v0.6.4

- Fix bug in hot-swaping
- Add isStatic parameter to merge and mergeAll
- Add defs to component type for dynamic components

# v0.6.3

- Fix bug with context

# v0.6.2

- Add isStatic META property
- Fix bug related to hot-swaping when dynamic modules are involved

# v0.6.1

- Add self component helper

# v0.6.0

- Add global notifier for parent components, use case dynamic lists of components
- Fix log utils for displaying when a component is removed
- Fix bug related to unmerge when name is zero

# v0.5.1

- Fix bug in reattach funtionality

# v0.5.0

- Multiple event data fetching with an array of arrays
- Covered act helper in utils/components
- A gap is defined with undefined (optional)

# v0.4.0

- Add act generic action dispatcher to component utils

# v0.3.2

- Fix types of ofuscator, absoluteCenter and placeholderColor helpers

# v0.3.1

- Add obfuscator helper to style utils

# v0.3.0

- Add support for multiple key-value fetching in computeEvent
- Add support for multiple key-value fetching in computeEvent at the end of a path
- Remove Handler type from handler definitions, it should be internal, REASON: improve DX

# v0.2.5

- Change ViewInterface for View in view interface
- Fix ViewInterface in all examples
- Add keywords to package.json

# v0.2.4

- Add Actions interface to core
- Add Components interface to core
- Make component inputs optional
- Make data parameter optional in Input and Action interfaces
- Add missing types to testForm example
- Update typescript version

# v0.2.3

- Make style group handler containerName parameter optional

# v0.2.2

- Fix type of style group handler
- Fix unused containerName option in style group handler

# v0.2.1

- Fix debugNames and add a debug option to style group handler

# v0.2.0

- Fix bug when call dispatch from a child component
- Add onDispatch event to module definition
- Add onDispatch function to log helpers
- Use onDispatch in testForm example

# v0.1.0

- Add mapToObj helper
- Following SEMVER from this version

# v0.0.10

- Fixed bug in hot-swaping related to edge case in mergeStates
