# Let's start simple

We love simplicity and minimalism, and if you are dealing with the inherent complexity of software you should too.

Well lets start!!, suppose you want to make a from like that:

(TODO: take an snapshot and put it here)
(TODO: link to working form here)
(TODO: link to working form code here)

We can divide it in components:

- Form
  - Teas per day Counter
  - Apples per day Counter
  - Name Input
  - Animated submit button

Nice!, we will start with or first component the Counter, this what we will do in this chapter. This is how Counter looks like:

(TODO: take an snapshot and put it here)
(TODO: link to working Counter)
[Code here](https://github.com/FractalBlocks/Fractal/tree/master/src/docs/counter)

And the final code:

```typescript
import { Inputs, Actions, Interfaces } from 'fractal-core'
import { View, h } from 'fractal-core/interfaces/view'

export const name = 'Counter'

export let state = 0

export type S = number

export const inputs: Inputs<S> = () => ({
  inc: actions.Inc,
  dec: actions.Dec,
})

export const actions: Actions<S> = {
  Inc: () => s => s + 1,
  Dec: () => s => s - 1,
}

const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { click: ev('inc') },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: { click: ev('dec') },
    }, '-'),
  ])

export const interfaces: Interfaces = { view }
```

Well, lets decompose the Counter behaviour in the Fractal way ;) .

The Counter should have:

- A value that we will call the `state` that is numeric and should be 0 by default
- A button for increment
- A text for showing the actual value
- A button for decrement

Well now what are the possible interactions?

- Click on Increment Button should add 1 to the `state`
- Click on Decrement Button should substract 1 to the `state`

Oh pretty simple right? let see some code, we will implement that using the requirements:

- Should have a value that we will call the `state` that is numeric and should be 0 by default

```typescript
export let state = 0

export type S = number
```

We declare a `state` variable and initialize to zero and declare the type `S` to `number`
The `export` stuff is because of we need to export this things to import them where we need the component

Oh too short!

- Should have a button for increment, this one is part of the view so see the code here:

```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'), // <--- increment button
  ])
```

The `h` function is a helper to create view elements
The `s` is the state variable and ctx is the context, we will go deeper in context later

- Should have a text for showing the actual value

```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'),
    h('div', s + ''), // <--- This line shows the state
  ])
```

The `s + ''` part transforms `s` to a string, avoiding a compile error

Lets see the structure of the `h` helper. There are three forms of using it:

```typescript
// h(tagName, string | arrayOfElements)
h('div', 'Hello!')
h('div', [])
// h(tagName, options, string | arrayOfElements)
h('div', {}, 'Hello!')
h('div', {}, [])
```

We will use the options object later, this is used for set attributes, properties, styles and events to the element

Next you can see an example of nesting elements:

```typescript
h('div', [
  h('div', 'element 1'),
  h('div', 'element 2'),
])
```

- Should have a button for decrement


```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'),
    h('div', s + ''),
    h('button', '-'), // <--- decrement button
  ])
```

Right now we have our component view almost complete. We need to work on the interactions that are only two

- Click on Increment Button should add 1 to the `state`

For achive that we need to listen for clicks in the Increment Button:

```typescript
const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { click: ev('inc') }, // <--- event listener that sends a message to 'inc' input when click the button
    }, '+'),
    h('div', s + ''),
    h('button', '-'),
  ])
```

In Fractal, the events from outside the application are like messages that inputs receive. Inputs are a very powerful concept we can use for complex event handling (you can use FRP here!), dispatching many actions / tasks and child-parent communication, we will go deeper on Fractal Inputs later.

```typescript
export const inputs: Inputs<S> = () => ({
  // inputName: msg => void | Executable | Executable[],
  inc: msg => console.log(msg),
})
```

Nice!! we receive the message!!, so we need to add 1 to `state`. The unique way to modify the state is via actions, this is a key concept in Fractal. See:

```typescript
export const actions: Actions<S> = {
  // actionName: actualState => newState,
  Inc: () => s => s + 1,
}
```

Pretty simple, an action is a function that receive the `state` and returns the next `state`. So we are going to execute 'Inc' action when the 'inc' input are triggered.

```typescript
export const inputs: Inputs<S> = () => ({
  inc: actions.Inc,
})
```

Next

- Click on Decrement Button should substract 1 to the `state`, so lets replicate the same as with Increment Button

```typescript
export const inputs: Inputs<S> = () => ({
  inc: actions.Inc,
  dec: actions.Dec,
})

export const actions: Actions<S> = {
  Inc: () => s => s + 1,
  Dec: () => s => s - 1,
}

const view: View<S> =
  () => s => h('div', [
    h('button', {
      on: { click: ev('inc') },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: { click: ev('dec') }, // <--- event listener that sends a message to 'dec' input when click the button
    }, '-'),
  ])
```

This is it, we have our first component, the Counter. Lets run it!, we will use the [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart), so visit and follow [this steps]([Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart#fractal-quickstart) to setup the quickstart.

In the `app/` [folder](https://github.com/FractalBlocks/Fractal-quickstart/tree/master/app) we have all the file for running our application.

First we will copy the code below to `Root.ts` (our Counter) file (in app/ folder)

```typescript
import { Inputs, Actions, Interfaces } from 'fractal-core'
import { View, h } from 'fractal-core/interfaces/view'

export const name = 'Counter'

export let state = 0

export type S = number

export const inputs: Inputs<S> = () => ({
  inc: actions.Inc,
  dec: actions.Dec,
})

export const actions: Actions<S> = {
  Inc: () => s => s + 1,
  Dec: () => s => s - 1,
}

const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { click: ev('inc') },
    }),
    h('div', s + ''),
    h('button', {
      on: { click: ev('dec') },
    }, '-'),
  ])

export const interfaces: Interfaces = { view }
```

Let's start the development server with `npm start` and open [http://localhost:3000](http://localhost:3000) in a new tab. Now you will see our awesome Counter, nice right?. Oh!! try the hot swapping feature, it's nice and so useful during development, change the count, modify the div that show the count as follows:

```typescript
const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { click: ev('inc') },
    }),
    h('div', 'Count: ' + s + ''),
    h('button', {
      on: { click: ev('dec') },
    }, '-'),
  ])
```

Save and see the browser, our code have been charged immediately without reload the page and without reseting our count. This is it!


Next section we will see how [Styling our Counter]() :heart: (Soon ...)
(TODO: link)

See the full [contents here](https://github.com/FractalBlocks/Fractal/tree/master/docs/tutorial/index.md)
