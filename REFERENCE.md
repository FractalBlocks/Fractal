# Reference (OUTDATED)

## TODOs

- Update this doc

## Code structure

Overview of files, the src/ folder

- core/: All Core Features of Fractal
- -- index.ts: Enty point to all core functions and interfaces
- -- core.ts: Set of core interfaces, e.g. components, updates ...
- -- handler.ts: Set of interfaces for handlers
- -- module.ts: Interfaces and functions for making Fractal Modules
- interfaces/: Set of built-in Fractal Interfaces, do something when state changes
- -- event.ts: Executes a callback
- -- view.ts: Render a Snabbdom view
- groups/
- -- style.ts: Style group for attaching styles to components using TypeStyle
- tasks/
- utils/
- -- component.ts: Helpers for composition and building components
- -- style.ts: Helpers for styling using TypeStyle
- -- worker.ts: Helper for running Fractal inside workers
- -- mori.ts: Helpers for mori PDS
- -- log.ts(DEV): Helpers for logging during development
- -- reattach.ts(DEV): Helpers for hot-swaping during development

TODO: complete docs
