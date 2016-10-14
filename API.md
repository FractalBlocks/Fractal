# Fractal API (TODO: update this)

The API is designed to be as simple as possible, helping to build and maintain code.

Missing API parts (TODO):

- Complete F.run documentation
- Task
- Driver
- Service
- helper functions

## core

- F.def: Make a module based on a definition object.

``` javascript
// objectDef -> moduleDef
F.def({
  // a function that returns the initial state (Necesary)
  init: () => ({}),
  // a function that is executed when the module is loaded (Optional)
  // returns an object with submodules definitions (for composing modules)
  load: (ctx, i, Action) => ({}),
  // a function that is executed after the module is loaded (Optional)
  // may be used for lazy loading modules, the modules should be passed in md callback
  // returns an object with submodules definitions (for composing modules)
  loadAfter: (ctx, i, Action, md) => {
    md({})
  },
  // input functions preserves the view pure and legible (Necesary)
  // returns a task, an Action (Actions are uppercase also Tasks), a Task or a list of Actions and Tasks
  // the returned value are executes syncronously, in case of a list are dispatched in ascendant order
  inputs: {
    name: () => []
  },
  // a list of output names, by convention each name should finalize with $
  ouputNames: ['someOutput$'],
  // actions are described by array of two elements
  // first an array with parameter types and second an update function in the form: (...params, state) -> newState
  // the action name may be UpperCamelCase
  // actions
  actions: {
    NameOfAction: [[...paramTypes], (...params, state) => newState],
  },
  // interfaces are functions that are executed in each state change
  // interfaces are used for side effects that are continnous in time (signals of side effects)
  // interfaces can attach event listeners and can return data to the external world
  interfaces: {
    // view are an special type of interface, this is required in many scenarios
    view: (ctx, i, m) => vDomNodes,
    // can be described other interfaces, the returned object should follow this structure
    // note that a driver for 'someInterface' is required
    someInterface: (ctx, i, m) => ({
      // lowerCamelCase named data
      dataName: {
        keyName1: someValue,
        success: someListener,
      },
    }),
  },
})
```

- F.run: Connects your main module with the external world and returns the engine definition.

``` javascript

// objectDef -> engineDef

let engine = F.run({
  root: yourMainModuleDef,
  tasks: {
    taskName: taskDefinition.task(...params),
  },
  drivers: {
    view: F.drivers.view('#containerId'),
  },
})
```

