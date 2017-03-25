[![codecov](https://codecov.io/gh/fractalPlatform/Fractal/branch/master/graph/badge.svg)](https://codecov.io/gh/fractalPlatform/Fractal)
[![Build Status](https://travis-ci.org/fractalPlatform/Fractal.svg?branch=master)](https://travis-ci.org/fractalPlatform/Fractal)
# <img src="https://github.com/fractalPlatform/Fractal/blob/master/assets/FractalLogo.png">

[![Join the chat at https://gitter.im/Fractal-core/Lobby](https://badges.gitter.im/Fractal-core/Lobby.svg)](https://gitter.im/Fractal-core/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
We believe into more than frameworks, we believe that minimalist and well crafted software will change the world. Lets build your ideas with elegance and simplicity with Fractal.

## How do Fractal it?

- It is minimal, core logic are less than 400 lines of code and you can see how it works
- Easy integrable and emmbedable by design
- A clear and flexible architecture that scales
- High code quality, we love that!! and helps you to achive it in your proyect :heart:
- Its clear and concise, all you application code are [pure functions](https://en.wikipedia.org/wiki/Pure_function). Your app code has NO side effects
- Gives you powerful patterns and composing tools that helps to build small and large apps
- Your code are flexible, composable and reausable. Modularization as a foundation
- The state is isolated, this mean is serializable and you can hot-swap code updating the UI without reload the navigator
- You can serialize the whole side effects, this means you can run fractal in a [webworker](https://github.com/fractalPlatform/Fractal/blob/master/examples/worker/index.ts), in a server via websockets or even in a remote browser via WebRTC :')
- Lazy loading of components

See the [design document](https://github.com/fractalPlatform/Fractal/blob/master/DESIGN.md). In order to be scalable, Fractal is implemented using [Typescript](https://www.typescriptlang.org/)

## Getting started

The recomended way is using webpack, please download the [Fractal-quickstart](https://github.com/fractalPlatform/Fractal-quickstart) repo, this gives you all things ready.

Or in nodejs, browserify, webpack like environments:

```bash
npm i --save fractal-core
```

## Run the examples

There are many useful examples at examples folder. Be sure that you have installed [Node.js](https://nodejs.org/en/), please [download Fractal source](https://github.com/fractalPlatform/Fractal/archive/master.zip) and extract them.

The examples you can run are:

- simple
- compose
- mori: Fractal using mori.js for persistent data structures (PDS)
- worker: Fractal running in a worker! :D
- testForm

Open a command window into `Fractal` folder and run:

```bash
npm i
npm run dev ./src/examples/NAME_OF_EXAMPLE
```
for example:

```bash
npm run dev ./examples/compose
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

Curious about how it works? see [Design Documentation](https://github.com/fractalPlatform/Fractal/blob/master/DESIGN.md) before reading source code :)

## Development

See our [Development Documentation](https://github.com/fractalPlatform/Fractal/blob/master/DEVELOPMENT.md)
