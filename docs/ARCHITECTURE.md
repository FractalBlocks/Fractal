# Architecture (WIP)

Fractal is a fully featured framework to make frontend apps using a simple and powerful architecture. It is based on the functional programming paradigm and other aproaches that simplify UI development. It may also be used in other contexts, note that Fractal.js is the implementation of the Fractal architecture for the web platform, but its designed to be language agnostic.

Fractal is an unidirectional user interface architeture that is fractal (autosimilar):

> A unidirectional architecture is said to be fractal if subcomponents are structured in the same way as the whole is.
> -[ Andre Staltz](http://staltz.com/unidirectional-user-interface-architectures.html)

Fractal modules are based on the [Model View Update architecture](http://staltz.com/unidirectional-user-interface-architectures.html#elm). This means that each module is mostly structured in this way.

Fractal offers a complete architecture with useful patterns and conventions that allows you center in usability, design and business logic instead of architecture.

All the application logic is contained into a main module and is hierachicaly structured and composed following the MVU pattern.

If you want to learn more about Fractal's main foundations check out:

- An awesome article called [Unidirectional user interface architectures](http://staltz.com/unidirectional-user-interface-architectures.html) by [Andre Staltz](http://staltz.com/)
- A nice repo and discuss in [functional-frontend-architecture](https://github.com/paldepind/functional-frontend-architecture) by [Simon Friss Vindum](https://github.com/paldepind)
- [Controlling Time and Space: understanding the many formulations of FRP](https://www.youtube.com/watch?v=Agu6jipKfYw) talk by Evan Czaplicki
- An article on why Fractal is [implemented in Typescript](http://staltz.com/all-js-libraries-should-be-authored-in-typescript.html) (See [Fractal Framework](https://github.com/fractalPlatform/Fractal)) (TODO-EVALUATE)
- [CSS in JS](https://vimeo.com/116209150) talk by Christopher Chedeau. [Slides here](https://speakerdeck.com/vjeux/react-css-in-js)
- [Virtual DOM approach](https://medium.com/@yelouafi/react-less-virtual-dom-with-snabbdom-functions-everywhere-53b672cb2fe3#.nfir9w2fb)
