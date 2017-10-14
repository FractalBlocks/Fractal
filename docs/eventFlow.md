TODO: fix this

function string makes easy to serialize InputData, if '*' the data fetched are the whole event object, if 'other' extract 'other' property from event object
   all this stuff allow to serialize communication between root component and handlers, this means you can execute a root component in a worker (even remotely in a host computer)
   and handlers still dispatch inputs, a solution for serializing event callbacks.
   this function is executed by interface / task handlers and his result is passed as a value to the dispatched component input passing as argument EventData
 Event Flow:
  - InputData (from component interface / task) comes with some data depending on the context
  - If needed, some handy / fancy CHANNEL serialize and transmit it
  - External things occurs, if InputData[3] is true the function string (InputData[2]) are excecuted, if not the value is taken, giving EventData as event data
  - If EventData has transferred via CHANNEL, the EventData is returned via this CHANNEL
  - the interface / task handler pass EventData to dispatch function
  - dispatch function fires the input in the respective component passing the event data

 The objective of this flow is allow handlers to be excecuted in workers or even remotely o.O
