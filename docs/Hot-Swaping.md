# Hot-Swaping

It is done in a pretty simple way. We save 'actions' all the time during development, so each time hot-swapping is activated, the whole component tree is recalculated and 'actions' are replayed. After that state should be consistent.

One of the reasons we encourage that dynamic components should be wrapped in actions its because this way actions are replayed over the lattest components code.
