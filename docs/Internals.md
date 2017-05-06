# Internals

The purpose of this document is describing the internal working of Fractal, to aim to be simple and easy to understand by new users.

## Interaction cycle

- Run Module
- Root component is connected to APIs via interfaces, gorups and tasks handlers
- Event loop, wait for user interaction
- An interface detect an interaction (e.g. user click a button)
- Interface handler uses `computeEvent` function to extract data from the Event object
- Interface handler call `dispatch` and pass the event data
- `dispatch` function interprets the event data and
- `dispatch` function call the Input function pass the data
- `dispatch` function call execute and pass the input result

