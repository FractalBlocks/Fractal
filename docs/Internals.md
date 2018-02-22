# How Fractal works in detail

The purpose of this document is describing the internal working of Fractal, to aim to be simple and easy to understand by new users.

## Start time

- All starts with the call of the `run` function, it creates a process we call Module, next steps are performed by the Module
- Build the initial component tree by reading _nest property of components state, starts with Root component and initialize the whole component tree. Component tree s internally flattened so all components live in an object where the key is the component identifier and the value is the execution her context. For each component:
  - Create the execution context (We call it a Context)
  - Process her groups passing them to group handlers, a good oppotunity to process styles.
  - Call `init` input.
- Root component is connected to interface handlers and perform the initial execution. The view is an interface, so at this time the initial render is done.

## Runtime


