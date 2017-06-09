# Let's start simple

We love simplicity and minimalism, and if you are dealing with the inherent complexity of software, you should too.

Well, lets start!!. Suppose you want to make a form like that:

(TODO: take an snapshot and put it here)
(TODO: link to working form here)
(TODO: link to working form code here)

We can divide it in components:

- Form
  - Teas per day Counter
  - Apples per day Counter
  - Name Input
  - Animated submit button

Nice!. We will start with our first component, the Counter, it is what we will do in this chapter. This is how Counter looks like:

Image (TODO: take an snapshot and put it here)

(TODO: link to working Counter)

[Link to code here](https://github.com/FractalBlocks/Fractal/tree/master/src/docs/counter)

Well, lets decompose the Counter behaviour in the Fractal way ;) .

The Counter should have the next requirements:

1. A value that we will call the `state` that is numeric and should be 0 by default
2. A button for increment
3. A text for showing the actual value
4. A button for decrement

Well now what are the possible interactions?

5. Click on Increment Button should add 1 to the `state`
6. Click on Decrement Button should substract 1 to the `state`

Oh! pretty simple, right?. Let see some code. We will implement it using the above requirements:

1. Should have a value that we will call the `state` that is numeric and should be 0 by default

```typescript
export let state = 0

export type S = number
```

We declare a `state` variable, initialize to zero and declare the type `S` to `number`. The `export` stuff is because of we will import them where we need the component

Oh!, too short!, lets continue

2. Should have a button for increment, this one is part of the view, so see the code:

```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'), // <--- increment button
  ])
```

The `h` function is a helper to create view elements.

The `s` is the state variable.

3. Should have a text for showing the actual value

```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'),
    h('div', s + ''), // <--- This line shows the state
  ])
```

For avoiding a compile error with `s` because `h` receives a string. The `s + ''` is the most easly way to parse `s` to a string.

Lets see the structure of the `h` function. There are three forms of using it:

```typescript
// h(tagName, string | arrayOfElements)
h('div', 'Hello!')
h('div', [])
// h(tagName, options, string | arrayOfElements)
h('div', {}, 'Hello!')
h('div', {}, [])
```

We will use the options object later, this is used for settting attributes, properties, styles and events to the element.

Next you can see an example of nesting elements:

```typescript
h('div', [
  h('div', 'element 1'),
  h('div', 'element 2'),
])
```

4. Should have a button for decrement

```typescript
const view: View<S> =
  () => s => h('div', [
    h('button', '+'),
    h('div', s + ''),
    h('button', '-'), // <--- decrement button
  ])
```

Right now we have our component view almost complete. We need to work on the interactions that are only two

5. Click on Increment Button should add 1 to the `state`

For achive it, we need to listen clicks in the Increment Button:

```typescript
const view: View<S> =
  ({ ev }) => s => h('div', [
    h('button', {
      on: { // 'on' is used to group event listeners such as: click, mouseover, keydown ...
        click: ev('inc'), // this line associate the click event with the 'inc' input
      },
    }, '+'),
    h('div', s + ''),
    h('button', '-'),
  ])
```

In Fractal, the events from outside the application are like messages that the `inputs` receives. `Inputs` are a very powerful concept. We can use it for:

- Dispatch many actions / tasks
- Child-parent communication
- Complex event handling (you can use FRP here!)

We will go deeper on Fractal `inputs` later.

We will declare our `inputs` below:

```typescript
export const inputs: Inputs<S> = () => ({
  // inputName: msg => void | Executable | Executable[],
  inc: () => console.log('User hits a click!!'),
})
```

Nice!! We receive the message!! So we need to add 1 to `state` and not to log 'User hits a click!!'. The unique way to modify the `state` is via `actions`, this is a key concept in Fractal.

Let's go ahead and declare our `actions`:

```typescript
export const actions: Actions<S> = {
  // actionName: actualState => newState,
  Inc: () => s => s + 1,
}
```

Pretty simple!!, An Action is a function that returns a function that takes the `state` and returns the next `state`. So, we are going to execute 'Inc' action when the 'inc' input is triggered, that is when the user clicked the Increment Button

```typescript
export const inputs: Inputs<S> = () => ({
  inc: actions.Inc,
})
```

Just one thing more!!

6. Click on Decrement Button should substract 1 to the `state`, so lets replicate the same as with Increment Button

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
      on: {
        click: ev('inc'),
      },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: {
        click: ev('dec'), // <--- event listener send a message to 'dec' input, when user click the button
      },
    }, '-'),
  ])
```

This is it!! we have our first component, the Counter. Lets run it!, we will use the [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart), so visit and follow [this steps](https://github.com/FractalBlocks/Fractal-quickstart#fractal-quickstart) to setup the quickstart.

In the `app/` [folder](https://github.com/FractalBlocks/Fractal-quickstart/tree/master/app) we have all files for running our application.

I an editor, lets copy the code below to `Root.ts` file (our Counter in app/ folder)

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


Next section we will see how [Styling our Counter]() :heart: (Soon ...) (TODO: link)

See the full [contents here](https://github.com/FractalBlocks/Fractal/tree/master/docs/tutorial/index.md)
