[![Build Status](https://travis-ci.org/FractalBlocks/Fractal.svg?branch=master)](https://travis-ci.org/FractalBlocks/Fractal)
[![Join the chat at https://gitter.im/Fractal-core/Lobby](https://badges.gitter.im/Fractal-core/Lobby.svg)](https://gitter.im/Fractal-core/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
# <img src="https://github.com/FractalBlocks/Fractal/blob/master/assets/FractalLogo.png">
We believe in more than frameworks, we believe that minimalist and well crafted software will change the world. Lets build your ideas with elegance and simplicity with Fractal.

## TLDR

We use better tools, we move fast, we love innovation ... Oh and Fractal is fractal, this means you can embed any Fractal app inside another with no effort

## How it works?

Concepts:

- Module: A engine for you app, connect a component tree to the external world.
- Component: Is a part of your app, a component have:
  - State: The component changing data.
  - Inputs: Async processes that recieve messages (data) from other components or outside the app, in an Input you can:
    - Send messages to other Inputs (same Component).
    - Send messages to other Components via Inputs.
    - Send messages outside the aplication with Tasks.
    - Perform side effects but only while prototyping, after that you should use Tasks.
  - Actions: The only way to change the state.
  - Interfaces: Here lives continous and hierachical connections with external world, the most common Interface is the `view`.
  - Groups: Data that can be used when a component is initialized, we use it for styles.
- Task: A mechanism to send messages to external world in a clean way (AKA perform side effects nicely), e.g. get some data from your local database.
- Handlers: Perform side effects, they receive messages from Tasks and hierachical structures from Interfaces and handle them.

Techniques:

- Fractal architecture: This is a kind of unidirectional user interface architecture see an insightful article [here](https://staltz.com/unidirectional-user-interface-architectures.html) by @staltz.
- Reactive views: We use [Snabbdom](https://github.com/snabbdom/snabbdom) for rendering.
- CSS in JS: We create styles in JS using [TypeStyle](https://github.com/typestyle/typestyle), see this [Vjeux slides](https://speakerdeck.com/vjeux/react-css-in-js).
- Typescript: We use [TypeScript](https://www.typescriptlang.org/) that is the same as JS but optionally you can have some types, we use it for better tooling [see this Eric Elliot article](https://medium.com/javascript-scene/the-shocking-secret-about-static-types-514d39bf30a3). Our lemma is to be fast with dynamic types but use types for stable code and some data modeling. We use it for:
  - A nice autocomplete for Styles and JavaScript
  - Errors in Styles (via TypeStyle)
  - Type some data models
  - Type functions
  - Catch syntax errors and a few bugs
- Hot-swapping: Live develop your application with no state loss. It gives you a nice developer experience.
- JS Bundling / Loading: [FuseBox](https://github.com/fuse-box/fuse-box) :fire::fire::fire: We love it! is fast, clear and powerful ... Oh! I said it's fast? .. Well, it's blazingly fast, let's try it!

## Features

- Fractal is minimal, composable and extendible
- Simple inter-component comunication via messages, you can broadcast messages to all components and listen for them
- Async operations made simple, all Fractal core make a wide use of async functions, and you can use it in your app
- Its clear and concise. All you application is nicely structured. Fractal manage and isolate side effects
- Blazingly fast because we use caching. This is possible because actions are the unique way of updating the state and the component view changes only depends on state so we only compute components that are actually needed. For DOM updates we use Snabbdom that it's pretty fast but you can use whatever DOM library you want, e.g. React
- You can easly serialize side effects, this means you can run Fractal in a Web Worker, in a server via Websockets or even in a remote browser via WebRTC, crazy right? :'). An example comming soon...
- We gives you powerful patterns and composing tools that helps you to build small and large apps like Legos
- A clear and flexible architecture that scales
- Easy sandbox an app, your app has an integrated API, pause and play it, this allow your app to be embeddable
- Easily integrable and embeddable by design
- High code quality, we love that!! and we helps you to achive it in your proyect :heart:
- The state is isolated, this mean it is serializable and you can hot-swap code updating the UI without reload the navigator
- Excellent developer experience. We love to improve your experience
    - We have hot-swapping
    - We have TimeTravel debugging (soon)
- Excellent error / warn handling:
    - Your app will never crash for a runtime error (Actually under testing, if you have an uncovered case please open an issue)
    - Application logs are meaningful. No more WTF?!! errors
    - You can search for any error in our complete error index, a list of all possible errors can happen with their respective solution (soon)
- Your code is flexible, composable and reausable. Modularization as a foundation
- Lazy loading of components
- We have high code quality standards and development flows you and your team can follow, from prototyping to production code (We will publish these soon ...)
- Prototype with ease and transform to a production level code with easy (Guide comming soon...)
- We support hot-swapping code in production :rose: (soon)

See the [design document](https://github.com/FractalBlocks/Fractal/blob/master/DESIGN.md). In order to be scalable, Fractal is implemented using [Typescript](https://www.typescriptlang.org/)

We make use of Fractal in our projects and this library is continuosly evolving, be in touch...

## Getting started

The recomended way is using FuseBox, please download the [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart) or [Fractal-featured](https://github.com/FractalBlocks/Fractal-featured) repo depending on your needs, this gives you all things ready to start hacking.

Or in nodejs, browserify, Webpack like environments:

```bash
npm i --save fractal-core
```

Or with yarn:

```bash
yarn add fractal-core
```

## Examples

Working examples you can start hacking immediately:

- [Counter](https://stackblitz.com/edit/fractal-counter?file=Root%2Findex.ts)
- [Simple Todo List](https://stackblitz.com/edit/fractal-simple-todo-list?file=Root/index.ts)
- [Filesystem View](https://stackblitz.com/edit/fractal-filesystem-view?file=Root%2Findex.ts)
- [API Users Posts](https://stackblitz.com/edit/fractal-api-users-posts?file=Root/index.ts)
- [Conway's Game of Life - Flat Version](https://stackblitz.com/edit/fractal-game-of-life-flat?file=Root%2Findex.ts)

## Tutorial

See our [tutorial](https://github.com/FractalBlocks/Fractal/blob/master/docs/tutorial/readme.md) and the examples (We are refactoring examples and tutorial, be in touch ...).

Note: The tutorial is not updated, we will update it soon.

## Development Notes

See our [Development Documentation](https://github.com/FractalBlocks/Fractal/blob/master/DEVELOPMENT.md)

## Related Projects

- [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart)
- [Fractal-featured](https://github.com/FractalBlocks/Fractal-featured)
- Fractal CLI (Comming soon...), making a spec
