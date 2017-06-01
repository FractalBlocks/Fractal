# Let's start simple

We love simplicity and minimalism, and if you are dealing with the inherent complexity of software you should too.

Well lets start!!, suppose you want to make a fromlike that:

(TODO: take an snapshot and put it here)

We can divide it in components:

- Form
  - Teas per day Counter
  - Apples per day Counter
  - Name Input
  - Animated submit button

Nice!, we will start with or first component the Counter, this what we will do in this chapter

Lets decompose the Counter behaviour in the Fractal way ;) .

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
  (ctx, s) => h('div', [
    h('button', '+'), // <--- increment button
  ])
```

The `h` function is a helper to create view elements
The `s` is the state variable and ctx is the context, we will go deeper in context later

- Should have a text for showing the actual value

```typescript
const view: View<S> =
  (ctx, s) => h('div', [
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
  (ctx, s) => h('div', [
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
  (ctx, s) => h('div', [
    h('button', {
      on: { click: ev(ctx, 'inc') }, // <--- event listener that sends a message to 'inc' input when click the button
    }, '+'),
    h('div', s + ''),
    h('button', '-'),
  ])
```

In Fractal, the events from outside the application are like messages that inputs receive. Inputs are a very powerful concept we can use for complex event handling (you can use FRP here!), dispatching many actions / tasks and child-parent communication, we will go deeper on Fractal Inputs later.

```typescript
export const inputs: Inputs = ctx => ({
  // inputName: msg => void | Executable | Executable[],
  inc: msg => console.log(msg),
})
```

Nice!! we receive the message!!, so we need to add 1 to `state`. The unique way to modify the state is via actions, this is a key concept in Fractal. See:

```typescript
export const actions: Actions = {
  // actionName: actualState => newState,
  Inc: s => s + 1,
}
```

Pretty simple, an action is a function that receive the `state` and returns the next `state`. So we are going to execute 'Inc' action when the 'inc' input are triggered.

```typescript
export const inputs: Inputs = ctx => ({
  inc: actions.Inc,
})
```

Next

- Click on Decrement Button should substract 1 to the `state`, so lets replicate the same as with Increment Button

```typescript
export const inputs: Inputs = ctx => ({
  inc: actions.Inc,
  dec: actions.Dec,
})

export const actions: Actions = {
  Inc: s => s + 1,
  Dec: s => s - 1,
}

const view: View<S> =
  (ctx, s) => h('div', [
    h('button', {
      on: { click: ev(ctx, 'inc') },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: { click: ev(ctx, 'dec') }, // <--- event listener that sends a message to 'dec' input when click the button
    }, '-'),
  ])
```

This is it, we have our first counter, next see the working code with extra import and export stuff

```typescript
import { Inputs, Actions, Interfaces, ev } from 'fractal-core'
import { View, h } from 'fractal-core/interfaces/view'

export let state = 0

export type S = number

export const inputs: Inputs = ctx => ({
  inc: actions.Inc,
  dec: actions.Dec,
})

export const actions: Actions = {
  Inc: s => s + 1,
  Dec: s => s - 1,
}

const view: View<S> =
  (ctx, s) => h('div', [
    h('button', {
      on: { click: ev(ctx, 'inc') },
    }, '+'),
    h('div', s + ''),
    h('button', {
      on: { click: ev(ctx, 'dec') },
    }, '-'),
  ])

export const interfaces: Interfaces = { view }
```

Whats next for this chapter?

- Run our Counter
- Use styles

Next chapters?

- Component Composition
  - Composition
  - Messaging
- Handlers (A.K.A. Side Effects)
  - Interfaces
  - Groups
  - Tasks
- Real world example
- Server Side Rendering (SSR)
