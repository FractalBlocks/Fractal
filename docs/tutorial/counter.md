# Let's start simple, a counter

Nice!. We will start with our first component, the Counter. This is how Counter looks like:

```
0 [+] [-]
```

This component has 3 visual elements:

- Value (0 by default)
- Increment button (+)
- Decrement button (-)

Well, lets decompose the Counter behaviour :O

The Counter should have the next requirements:

1. Save the `count` that is numeric and should be 0 by default
2. A text for showing the actual `count`
3. A button for increment the `count`
4. A button for decrement the `count`

Well now what are the possible interactions?

5. Click on Increment Button should add 1 to the `count`
6. Click on Decrement Button should substract 1 to the `count`

Oh! pretty simple, right?. We will implement it using the above requirements.

## Save the count that is numeric and should be 0 by default

Well, we have a site where we save things, this is called the state and is an object containing all the thing we want to be saved in our component, so you have to describe the initial value of it. In this case:

```typescript
export let state = {
  count: 0, // count starts in zero
}
```

## A text for showing the actual count

```typescript
const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    // Above line show the count, the "+ ''" part is for casting count number to string
  ])
```

The `h` function is a helper to create view elements. The `s` is the state variable, that containt our `count`.


Lets see the structure of the `h` function. There are three forms of using it:

```typescript
// h(tagName, string | arrayOfElements)
h('div', 'Hello!')
h('div', [])
// h(tagName, options, string | arrayOfElements)
h('div', {}, 'Hello!')
h('div', {}, [])
```

We will use the options object later, this is used for settting attributes, properties, styles, data and events to the element.

You can nest elements too:

```typescript
h('div', [
  h('div', 'element 1'),
  h('div', 'element 2'),
])
```

## A button for increment

This one is part of the view, so see the code:

```typescript
const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    h('button', '+'), // <--- increment button
  ])
```

## A button for decrement

```typescript
const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    h('button', '+'),
    h('button', '-'), // <--- decrement button
  ])
```

Right now we have our component view almost complete. We need to work on the interactions that are only two

## Click on Increment Button should add 1 to the count

For achive it, we need to listen clicks in the Increment Button:

```typescript
const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    h('button', {
      on: { // 'on' is used to group event listeners such as: click, mouseover, keydown ...
        click: F.act('Inc'), // this line associate the click event with the 'Inc' action
      },
    }, '+'),
    h('button', '-'),
  ])
```

So when you click the increment button the `Inc` action is executed and the count increments by 1

What is an action? In short is the unique way for changing the state. All the changes you want to do in the state, you should execute an action

Let's go ahead and declare our `Inc` action:

```typescript
export const actions: Actions<S> = {
  // actionName: param -> actualState -> newState,
  Inc: () => s => {
    s.count++
    return s
  },
}
```

Now a more detailed explamation. An Action is a function that returns an update. An update is a function that takes the `state` and returns the next `state`. So, we are going to execute 'Inc' action when the user clicked the Increment Button

Just one thing more!!

## Click on Decrement Button should substract 1 to the count

Let's replicate the same as with the Increment Button

```typescript
export const actions: Actions<S> = {
  Inc: () => s => {
    s.count++
    return s
  },
  Dec: () => s => {
    s.count--
    return s
  },
}

const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    h('button', {
      on: {
        click: F.act('Inc'),
      },
    }, '+'),
    h('button', {
      on: {
        click: F.act('Dec'),
      },
    }, '-'),
  ])
```

This is it!! we have our first component, the Counter. Lets run it!, use the [Fractal-quickstart](https://github.com/FractalBlocks/Fractal-quickstart), so visit and follow [this steps](https://github.com/FractalBlocks/Fractal-quickstart#fractal-quickstart) to setup the quickstart.

In the `app/` [folder](https://github.com/FractalBlocks/Fractal-quickstart/tree/master/app) we have all the files for running our application.

In an editor, lets copy the code below and paste it to `Root/index.ts` file in `app/` folder.

```typescript
import {
  Actions,
  Interfaces,
} from 'fractal-core'
import { View, h } from 'fractal-core/interfaces/view'

export let state = {
  count: 0,
}

export type S = typeof state
// Above line is for saving the structure of the state in the type `S`, this is related with the type system (in TS) and we use it for better dev tooling like autocompletion and to detect certain kind of bugs.

export const actions: Actions<S> = {
  Inc: () => s => {
    s.count++
    return s
  },
  Dec: () => s => {
    s.count--
    return s
  },
}

const view: View<S> =
  F => s => h('div', [
    h('div', s.count + ''),
    h('button', {
      on: { click: F.act('Inc') },
    }, '+'),
    h('button', {
      on: { click: F.act('Dec') },
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

See the full [contents here](index.md)
