# Basic Concepts

Let's start!

## Component

A component is an small part of your app, think in it as a living cell or a block of lego. Components can be nested into other components for building more complex ones.

### State

Are a set of variables (changing data) that are related to your component's functionality

### Action

The unique way for updating the state is to execute an Action, an Action takes the state the unique thing it does is to update it

### Task

A Task is a way of sending things to external world aka perform side effects. Is similar to what in some frameworks are named services. You cn use it for performing DB operations, feching data and intercomunicate your app.

### Input

Inputs are processes that have the main logic of the component and in are the center of processing. Inputs are related with all the logic that are related with communications. Inputs can do:

- Execute Actions, this means change the state.
- Execute Tasks
- Execute Inputs of child components or the component itself.

### Interface

An interface is a way for building hierachical side effects that are recalculated each time state changes. The most common one is the View.

### Group



## Module

A module is who makes your app work, it has a Root component that is the entry point for your app component tree. A module have Handlers for managing all kind of side effects components does, there are Task, Interface and Group Handlers.

## Comunications



## Child input listeners (AKA input propagation)

## Component Message Interchange (AKA messages)
