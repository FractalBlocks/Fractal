# Fractal is now in Typescript

We will focus on next topics:

- Simple API + simple architecture (do other diagram like architecture diagram, but focus on what is useful for users)
- Focus on small and emmbedable modules
- Small code (removing some dependencies)
- Mori for persistent data structures
- Typed views via new Snabbdom with Typescript
- Better composing API
- Better and simple docs, live docs
- Behaviors optimization pattern, via tasks
- Tween.js task for animations
- Router pattern (urls)

FractalBlocks UI follows the same topics

## Dependencies

- Maintain package.json as simple as possible, less dependencies, less scripts ...

## Scripts

List of possible commands, we maintain package.json as simple as possible

"lint": "tslint src/**/*.ts",
"build": "rimraf lib/ && tsc",
"benchmarks": "ts-node benchmarks/index.ts",
"prepublish": "typings install && npm run build",
"compile": "cross-env NODE_ENV=production webpack --config webpack/dist.config.js --progress",
"compile-dev": "cross-env NODE_ENV=production webpack --config webpack/dist-dev.config.js --progress",
"compile-server": "cross-env NODE_ENV=production webpack --config webpack/webpack-server.config.js --progress",
"test-dev": "webpack-dev-server --config webpack/test-dev.config.js --progress",
"general": "cross-env NODE_ENV=development node tasktool",
"general-compile": "cross-env NODE_ENV=production node tasktool",
"postinstall": "typings install dt~jasmine --save --global",
"test": "ts-node node_modules/jasmine/bin/jasmine.js JASMINE_CONFIG_PATH=jasmine.json",
"test:coverage": "ts-node node_modules/istanbul/lib/cli.js cover -e .ts  -x \"*.d.ts\" -x \"*.spec.ts\" node_modules/jasmine/bin/jasmine.js -- JASMINE_CONFIG_PATH=jasmine.json"
