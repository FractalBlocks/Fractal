[![codecov](https://codecov.io/gh/fractalPlatform/Fractal/branch/master/graph/badge.svg)](https://codecov.io/gh/fractalPlatform/Fractal)
[![Build Status](https://travis-ci.org/fractalPlatform/Fractal.svg?branch=master)](https://travis-ci.org/fractalPlatform/Fractal)

<img src="https://github.com/fractalPlatform/Fractal/blob/master/assets/fractaltexto.png" width="520px">

Build your ideas as simple as possible. Fractal is an intuitive framework for building applications and interactive content.

## Why?

- Easy integrable and emmbedable by design
- A clear and flexible architecture that scales
- Its clear and concise, all you application code are [pure functions](https://en.wikipedia.org/wiki/Pure_function). Your app code has NO side effects
- Gives you powerful patterns and composing tools that helps to build small and large apps
- Your code are flexible, composable and reausable. Modularization as a foundation
- The state is isolated, this mean is serializable and you can hot-swap code updating the UI without reload the navigator
- You can lazy loading modules
- Router module for easely URL integration and server side rendering (Work in progress)
- BDD and code coverage integrated (Work in progress)

See the detailed [architecture here](https://github.com/fractalPlatform/Fractal/blob/master/docs/ARCHITECTURE.md). In order to be scalable, Fractal is implemented using [Typescript](https://www.typescriptlang.org/)

## Make your own Fractal based app

The recomended way is using webpack, please download the [Fractal-quickstart](https://github.com/fractalPlatform/Fractal-quickstart) repo (Comming soon...).

Or in nodejs, browserify, webpack like environments:

```bash
npm i --save fractal-framework
```

See [Tutorial](https://github.com/fractalPlatform/Fractal/blob/master/docs/tutorials/tutorial.md) for getting started with Fractal.

### Run the examples

There are many useful examples at examples folder. Be sure that you have installed [Node.js](https://nodejs.org/en/), please [download Fractal source](https://github.com/fractalPlatform/Fractal/archive/master.zip) and extract them.

The examples you can run are:

- playground
- counterAndList
- chat
- mailboxNoRouter
- tasks

Open a command window into `Fractal` folder and run:

```bash
npm i
npm run general NAME_OF_EXAMPLE
```

Some examples needs a backend (e.g. Chat or mailboxNoRouter), run it with:

```bash
cd examples/NAME_OF_EXAMPLE
npm i
node server
```

See the [README of the example](https://github.com/fractalPlatform/Fractal/tree/master/examples) you want to run for a detailed description.

## Building

For a production version run: `npm run compile`, and see the result in the `dist/` folder.

## Tips

- Assets are static, these are copied to the dist folder when you compile the app.
- Resources are dynamic these are inserted when your require (e.g. require('../resources/myresource.png') ) them, this are serialized and inserted into code.
