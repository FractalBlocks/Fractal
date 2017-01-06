# Reference

## TODOs

- Clean useless files
- Implement simple and intuitive examples
- Port basic examples of Fractal.js to new version
- Implement reference docs generation from tests

## Code structure

Overview of files

- stream.ts: Implementation of a basic stream
- core.ts: Set of core interfaces of Fractal
- interface.ts: Set of interfaces (TS) for Fractal Interfaces
- engine.ts: Interfaces and `run()` function for making Fractal Engines
- composition.ts: Interfaces and `merge()` function for composing modules
- interfaces/: Set of built-in Fractal Interfaces, do something when state changes
- -- event.ts: Executes a callback
- -- view.ts: Render a Snabbdom view
