# Changes

## Whats next?

- Generic subscribe interface

# v4.3.0

- Fix propagation data
- Router interface MVP
- Optimize propagation (BREAKING)
- Remove navigo router interface
- Fix bundlePaths in ssr helpers, do it not optional
- Change log functions from async to sync
- Fix destroy component hook bug
- Change input hooks from async to sync
- Fix component  Root id

## v4.2.3

- Enable input hooks (HOTFIX)

## v4.2.2

- Fix `act` interface helper

## v4.2.1

- Implement `getParentCtx`, `mapAsync`, `filterAsync`, `reduceAsync` and `all` functions

## v4.2.0

- Improve event system, optimization and clean code
- Replace `dispatch` in built-in hanlders
- Remove `dispatch` for moduleAPI (BREAKING CHANGE)
- Implement `toComp` and `dispatchEv` for ModuleAPI
- Delete unused value interface

## v4.1.17

- Move fs-jetpack to dev dependencies

## v4.1.16

- Fix interfaces type to be async
- Add async type to renderHTML function

## v4.1.15

- Implement htmlFn for replacing transformHTML function, allows customization
- Implement transformHTML function in renderHTML
- Implement base url for AOT / SSR

## v4.1.14

- Implement bundlePaths for SSR and AOT and remove bundlePath

## v4.1.12-13 (Fix broken build)

- Add fs-jetpack and always reads utf8 from files in AOT compilation

## v4.1.11

- Await for beforeInit hook
- Fix encoding optional parameter
- Logs and module hooks are now async

## v4.1.10

- Fix initial global values for rendering
- Fix use of render in module definitions
- Fix AOT and SSR
- Change location of prerender template
- Add options to `runModule`, this allow module definitions to be extendable

## v4.1.9

- `clearCache` now clear descendants
- Implement `getDescendantIds` function

## v4.1.8

- Add `clearCache` function to input helpers

## v4.1.7

- Update TypeStyle dependency
- Update Snabbdom dependency
- Optimization in interface recalculation

## v4.1.6

- Fix placholderColor for Firefox
- Remove duplicated parameter in `propagate` function

## v4.1.5

- Implement `optionalBroadcast`, `seqBroadcast` and `seqOptionalBroadcast` to `comps` helper in inputs

## v4.1.4

- Rename vws function to group
- Add vws function for rendering an array of component names

## v4.1.3

- Fix ordering in action records

## v4.1.2

- Fix interface excecution

## v4.1.1

- Add type signature for async interfaces

## v4.1.0

- Interfaces are now async

## v4.0.6

- Add global active flag to modules
- Disable render when init components and add moduleRender option
- Inputs processes can continue execution when hot-swap ocurrs

## v4.0.5

- Updates can be async functions and sync too

## v4.0.4

- Fix component update flag

## v4.0.3

- Add getCompleteNames method

## v4.0.2

- Add getNames method
- Add getCompleteName type signature to ComponentHelpers

## v4.0.1

- All component methods now return values

## v4.0.0

- Fix: init and destroy are not called during hot-swaping
- Fix generic propagation name argument
- Fix lifecycle ordering
- Add init and destroy lifecycle hooks
- Remove unused input helpers
- init and destroy input are handled in the lifecycle
- Merge Contexts and Spaces into only Contexts
- Components are into _nest variable of parent
- Remove input returns
- Add AddComp helper for dynamic composing
- Add _remove default action helper for dynamic composing
- Remove name from components
- Add Set generic action by default
- Add _action and _execute inputs
- Remove return and action
- Add 'record' option to record all actions
- Actions ensures in-order execution
- State always are an onject
- Update TypeStyle dependency - performance boost

## v3.3.3

- Fix async CtxInterface

## v3.3.2

- CtxInterface can be an async function

## v3.3.1

- Fix mistake in getState component helper, bad use of nameFn

## v3.3.0

- Add runIt input helper and default return input to components

## v3.2.1

- Fix executeAll from comps helper

## v3.2.0

- Add 'compGroup', 'comps' and 'vws' helpers

## v3.1.2

- Add sizeTask
- Add act helper to input helpers

## v3.1.1

- Fix coupled group name in style group handler

## v3.1.0

- Add AOT helpers
- Add server side rendering helpers
- Fix error message

## v3.0.7

- Input errors are delegated to caller functions
- Fix: action input helper can be overwritten by the component

# v3.0.6

- Inputs can be norma functions not only async

# v3.0.5

- Add render global flag to module options
- Remove log unused stuff

## v3.0.4

- Add render global flag for SSR performance

## v3.0.0

- Worker support fixed!
- Handlers are now async
- Add full async support (WIP)
- toIt, toAct and toChild are async by default. Async param is removed (Breaking change)
- Add async inputs support

## v2.10.3

- Hotfix, do not call init on hot-swap

## v2.10.2

- Fix size binding interface

## v2.10.1

- Hotfix to include type definitions in compiled code

## v2.10.0

- Add CSS class to style helpers
- Include action input helper by default

## v2.9.6

- Fix, do not call init when hot-swap

## v2.9.4

- Fix AOT

## v2.9.3

- Make view interface handler universal (SSR & Prerendering)
- Add cb to view interface handler
- Fix style group handler implementation

## v2.9.2

- Hotfix for v2.9.1

## v2.9.1

- Adapt style group handler for SSR and prerender

## v2.9.0

- Size binding snabbdom module for bind the element size to the state
- Integrate ResizeSensor for listening element size changes
- Fix type of event and global listeners module for accepting arrays of InputData
- Inject input helpers to component hooks

## v2.8.0

- Implement path updates (fixes bugs in interface cache implementation)
- Cached interfaces (CRAZY optimization, now interfaces are blazingly more faster)
- Root context delegation
- Fix deepmerge issue

## v2.7.0

- Test case for hotfix in `action` function in component helpers
- Add deepmerge as a dependency
- Hotfix in `action` function in component helpers
- Add deepmerge and deepmergeAll functions to functional helpers
- Add `styles` function for making a new component by merging the component style

## v2.6.0

- Test of interfaceOrder
- Test of async notifyInterfaceHandlers
- Add ignore to global event listener type signature
- Add interfaceOrder to modules
- notifyInterfaceHandlers works async

## v2.5.0

- Add router interface handler

## v2.4.1

- Replace css property -moz-placeholder by placeholder-shown for Firefox 51+

## v2.4.0

- Add selfPropagated property to global event listeners
- Refactor event propagation
- Add isDescendant view helper
- Make input and interface helpers internal methods differnt with _, for example act with _act

## v2.3.2

- Fix default prevented behaviour

## v2.3.1

- Global event listeners do not handle prevented events by default
- Add listenPrevented options to event listeners

## v2.3.0

- Global event listeners handle all the events, and normal do not handle events that are prevented
- stopPropagation is not allowed by design

## v2.2.1

- Fix implementation of dynamic propagation

## v2.2.0

- Reimplemented propagation in simple, dynamic and general, as a sequence
- Fix sendMsg and toAct functions
- Add error message when toChild is executed with an invalid child name
- Add async option to sendMsg function
- Change the order of isAsync and isPropagate arguments
- Fix global event listeners async
- Add async option to toIt, toChild and toAct

## v2.1.1

- Remove mori helpers from core

## v2.1.0

- Ignore log.ts and style.ts coverage for now
- Remove cs() unused function from style.ts
- Due to Webpack 2 has tree shaking and is the desired build tool, we should have one import for all the core functions, migration all helpers to core index

## v2.0.4

- Fix input import in core.ts
- Fix input import in log.ts

## v2.0.3

- Fix dependencies from input refactor
- Add input to core (fix)
- Rename inputs for input

## v2.0.2

- Fix CtxNest type signature and worker.ts

## v2.0.1

- Add stateOf to interface helpers

## v2.0.0

- Add stateOf, toIt, toChild, nest, unnest, nestAll and unnestAll to input helpers and curry them
- Group all input helpers to inputs.ts
- Interface ctx argument replaced by helpers object, increase redability and speed
- Currying all the interface helpers and group on interface.ts
- Add an interface index to ComponentSpace increasing speed
- Inputs ctx argument replaced by input helpers object
- Currying interfaces for optimize speed
- Fix logging stuff in globalListeners

## v1.6.0

- toParent has removed because enforce coupling of components
- act has new signature
- Add toAct helper

## v1.5.6

- Global listeners are attached to main container

## v1.5.5

- Fix bug related to global-local listeners

## v1.5.4

- Event options are optional in core interface

## v1.5.3

- Fix bad npm upload

## v1.5.2

- Add options parameter to event listeners at Fractal core, with `default` and `propagate` options

## v1.5.1

- View event listeners can control preventDefault and stopPropagation via context data _default and _propagate properties

## v1.5.0

- Add global events handler to view interface

## v1.4.13

- Component init hooks are executed after first `notifyInterfaceHandlers`
- Add Components type to components parameter of nest function

## v1.4.12

- Add VNode to View interface exports

## v1.4.11

- Rename `merge` core function to `nest`

## v1.4.10

- Fix type signature of `assoc` functional helper

## v1.4.9

- Fix build

## v1.4.8

- Refactor view interface file structure
- Include h as a view method
- Include vnode into core view methods

## v1.4.7

- Add ignore to On interface for event handlers

## v1.4.6

- Update snabbdom version
- Implement VNodeData and other stuff for h types
- Add `interfaces/h` for using without import snabbdom

## v1.4.5

- Fix view event listeners snabbdom module event pausing

## v1.4.4

- Add merge to functional utils fun.ts

## v1.4.3

- Fix execute function
- Move toIt to core

## v1.4.2

- Fix log when state is not an object

## v1.4.1

- Fix log functions

## v1.4.0

- Add isPropagated optional parameter to dispatch function
- Refactor and simplify API
- Remove onDispatch event from Module and log helpers
- Add beforeInput and afterInput events to Context and Module
- Better Logging functions

## v1.3.1

- Speed up core replacing for-Object.keys loop by for-in
- Message Interchange fuctions propagation is optional, true by default

## v1.3.0

- Remove useless parameter from `execute` function
- Remove useless parameter from `propagate` function

## v1.2.1

- Fix nested propagation

## v1.2.0

- Fix component message interchange by adding propagation
- Add scope to global component listeners (parent -child communication)

## v1.1.0

- Add functional utils to `fun.ts`
- Add assoc, evolve and evolveKey function to fun utils
- Add type Interface<Type, S> and refactor View type in View interface
- Relocate utils to root folder (src)

## v1.0.8

- Parent can observe any child input

## v1.0.7

- Make msg parameter of sendMsg and toIt optional in utils/component

## v1.0.6

- Add ignore and pass options to view event handlers

## v1.0.5

- Add event stoping in view event handlers

## v1.0.4

- Add ignored view event listeners

## v1.0.3

- Fix bug in dispatch

## v1.0.2

- Fix some types to be useful

## v1.0.1

- Add functional utils (fun) with pipe and mapToObj and remove them from component utils

## v1.0.0 :rose:

- Allow use `Actions<typeof state>` for typesafe actions (BREAKING CHANGE)
- Create Id type that can be Number | String, for avoid using <any> in dynamic components
- Update examples

## v0.7.7

- Add toIt helper for sending messages to the same component
- toChild log an error when child does not have the input

## v0.7.6

- toParent helper log an error when parent does not handle child messages

## v0.7.5

- Improve implementation of child -> parent communication via toParent for better performance and clarity

## v0.7.4

- Add stateOf name parameter for fixing API
- Add clickable style helper
- Improve update examples

## v0.7.3

- Fix broken stuff after removing core/stateOf

## v0.7.2

- Remove core/stateOf duplicated method

## v0.7.1

- Fix bug with notifyHandlers

## v0.7.0

- Add sendMsg and toChild function to component helpers for better messaging
- Fix a test and coverage in worker helpers

## v0.6.8

- Add fetch value option for generic inputs

## v0.6.7

- Fix edge case with child components with dynamic parents

## v0.6.6

- Fix error with reattach when parent component don't have defs

## v0.6.5

- Add error when component defs of a parent does not have definition of a dynamic component

## v0.6.4

- Fix bug in hot-swaping
- Add isStatic parameter to merge and mergeAll
- Add defs to component type for dynamic components

## v0.6.3

- Fix bug with context

## v0.6.2

- Add isStatic META property
- Fix bug related to hot-swaping when dynamic modules are involved

## v0.6.1

- Add self component helper

## v0.6.0

- Add global notifier for parent components, use case dynamic lists of components
- Fix log utils for displaying when a component is removed
- Fix bug related to unmerge when name is zero

## v0.5.1

- Fix bug in reattach funtionality

## v0.5.0

- Multiple event data fetching with an array of arrays
- Covered act helper in utils/components
- A gap is defined with undefined (optional)

## v0.4.0

- Add act generic action dispatcher to component utils

## v0.3.2

- Fix types of ofuscator, absoluteCenter and placeholderColor helpers

## v0.3.1

- Add obfuscator helper to style utils

## v0.3.0

- Add support for multiple key-value fetching in computeEvent
- Add support for multiple key-value fetching in computeEvent at the end of a path
- Remove Handler type from handler definitions, it should be internal, REASON: improve DX

## v0.2.5

- Change ViewInterface for View in view interface
- Fix ViewInterface in all examples
- Add keywords to package.json

## v0.2.4

- Add Actions interface to core
- Add Components interface to core
- Make component inputs optional
- Make data parameter optional in Input and Action interfaces
- Add missing types to testForm example
- Update typescript version

## v0.2.3

- Make style group handler containerName parameter optional

## v0.2.2

- Fix type of style group handler
- Fix unused containerName option in style group handler

## v0.2.1

- Fix debugNames and add a debug option to style group handler

## v0.2.0

- Fix bug when call dispatch from a child component
- Add onDispatch event to module definition
- Add onDispatch function to log helpers
- Use onDispatch in testForm example

## v0.1.0

- Add mapToObj helper
- Following SEMVER from this version

## v0.0.10

- Fixed bug in hot-swaping related to edge case in mergeStates
