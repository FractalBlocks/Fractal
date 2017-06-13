[![codecov](https://codecov.io/gh/FractalBlocks/Fractal/branch/master/graph/badge.svg)](https://codecov.io/gh/FractalBlocks/Fractal)
[![Build Status](https://travis-ci.org/FractalBlocks/Fractal.svg?branch=master)](https://travis-ci.org/FractalBlocks/Fractal)
[![Join the chat at https://gitter.im/Fractal-core/Lobby](https://badges.gitter.im/Fractal-core/Lobby.svg)](https://gitter.im/Fractal-core/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
# <img src="https://github.com/FractalBlocks/Fractal/blob/master/assets/FractalLogo.png">
We believe in more than frameworks, we believe that minimalist and well crafted software will change the world. Lets build your ideas with elegance and simplicity with Fractal.

## How it works?

- Fractal is minimal. Core logic is less than 700 lines of code and you can see how it works
- Excellent developer experience. We love to improve your experience
    - We have hot-swapping
    - We have TimeTravel debugging (soon)
- Excellent error / warn handling:
    - Your app will never crash
    - Application logs are meaningful. No more WTF?!! errors
    - You can search for any error in our complete error index, a list of all possible errors can happen with their respective solution (soon)
- You can serialize the whole side effects, this means you can run Fractal in a [Web Worker](https://github.com/FractalBlocks/Fractal/blob/master/src/examples/worker/index.ts), in a server via websockets or even in a remote browser via WebRTC :')
- Gives you powerful patterns and composing tools that helps to build small and large apps
- A clear and flexible architecture that scales
- Easily integrable and embeddable by design
- High code quality, we love that!! and we helps you to achive it in your proyect :heart:
- Its clear and concise. All you application code are [pure functions](https://en.wikipedia.org/wiki/Pure_function). Your app code has NO side effects
- We support hot-swapping code in production :rose: (soon)
- Your code is flexible, composable and reausable. Modularization as a foundation
- The state is isolated, this mean it is serializable and you can hot-swap code updating the UI without reload the navigator
- Blazingly fast because we use WebAssembly (Soon ... Work In Progress)
- Lazy loading of components (soon)

See the [design document](https://github.com/FractalBlocks/Fractal/blob/master/DESIGN.md). In order to be scalable, Fractal is implemented using [Typescript](https://www.typescriptlang.org/)

## Getting started

The recomended way is using Webpack, please download the [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart) repo, this gives you all things ready.

Or in nodejs, browserify, Webpack like environments:

```bash
npm i --save fractal-core
```

Or see our [tutorial](https://github.com/FractalBlocks/Fractal/blob/master/docs/tutorial/readme.md) and the examples.

## Run the examples

There are many useful examples at examples folder. Be sure that you have installed [Node.js](https://nodejs.org/en/), please [download Fractal source](https://github.com/FractalBlocks/Fractal/archive/master.zip) and extract them.

The examples you can run are:

- simple
- compose
- mori: Fractal using mori.js for persistent data structures (PDS)
- testForm
- dynamicList
- complexList
- worker: Fractal running in a worker! :D (refactor in progress, broken until next relase)

Open a command window into `Fractal` folder and run:

```bash
npm i
npm run dev ./src/examples/NAME_OF_EXAMPLE
```
for example:

```bash
npm run dev ./src/examples/complexList
```

## Run tests

Our rule is to have 100% of coverage, right now all core features are covered

```bash
// once
npm test
// dev server
npm run test:watch
```

## Design

Curious about how it works? see [Design Documentation](https://github.com/FractalBlocks/Fractal/blob/master/DESIGN.md) before reading source code :)

## Development

See our [Development Documentation](https://github.com/FractalBlocks/Fractal/blob/master/DEVELOPMENT.md)
