# Dynamic Components

Dynamically added components either loaded statically or dynamically (e.g. with code splitting) should be wrapped in an action, this way we decouple components code from the action it-self, so an action should never receive a component as parameter.
