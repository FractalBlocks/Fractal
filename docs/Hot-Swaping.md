# Hot-Swaping algorithm (reconciliation)

The scenario, incoming hot-swap update, there are:

- Last components (0 subindex)
- New / Incoming components (n subindex)

And we need to figure out how to obtain the uptated components (1 subindex) for static components (S) and dynamic components (D), here is how:

Given the next operations:

- Merge components states: mergeStates = CompSet => map((C0, Cn) -> C1, CompSet), through the same component C

S1 = (Sn - (Sn ∩ S0)) + mergeStates(Sn ∩ S0)

D1 =
