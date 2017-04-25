# Changes

# Changes for Fractal core

# Next

- Speed up core replacing for-Objec.keys loop by for-in
- Add functions to `fun.ts` that includes: assoc, evolve, not, inc, dec, same (identity) and ifelse all mutant and fully currified

## Done

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
