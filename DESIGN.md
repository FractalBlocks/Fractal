# Fractal is now in Typescript

## TODOS:

- Module should have an error and warning handler for log reporting middleware (DX)
- Integrate standard linter + trailing commas with tslint

## Philosophy

We will focus on next topics:

- Simple API + simple architecture (do other diagram like architecture diagram, but focus on what is useful for users)
- Focus on small and emmbedable components
- Tasks are atomic
- Small code (removing some dependencies), ALAP
- Modules never crash at runtime, but performs a good error hadling and reporting
- Mori for persistent data structures
- Typed views via new Snabbdom with Typescript
- Better composing API
- Better and simple docs, live docs
- Behaviors optimization pattern, via tasks
- Tween.js task for animations
- Router pattern (urls)

FractalBlocks UI follows the same topics

## Dependencies

- Fractal core should not have any dependencies, this is a design choice
- Maintain package.json as simple as possible, less dependencies, less scripts ...

## Concepts

- component: is a small or big part of your app, and is designed for composition.
- module: a module runs one component (AKA root component), connecting it to external world. A component can be composed of more components in a tree
- interface: is the part of a component that is responsible of communications (external world, AKA side effects)
- interface handler: is a part of an module that handle interfaces of root component. Performs a certain type of side effects.
- state: is the part of a component related to their data
- action: is a part of a component that is the unique way to update the state
- task: is an information related to a specific side effect, tasks are dispatched by components via inputs (see later)
- task handler: is a part of an module that handle tasks, performing side effects of certain type
- input: is a part of a component that is a dispatcher for actions and tasks
- component lifecycle
- Fractal arquitecture: is the whole way in that data and functionality are handled

## Ideas

- IMPORTANT: styles showld be separated and are a function of palette and other globals (maximum customization and weight)
