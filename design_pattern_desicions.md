### Description of Design Decisions
Aside from the circuit breaker, the *fail early and fail loud* pattern is also used. All public functions check several conditions in the beginning such as the trade state or access control and revert if they are not met.

In addition *pull over push payments* are made. When creating a trade, the token owner approves the contract which pulls the token. Similarly a completed trade only approves the owner to withdraw the token and does not transfer it.

*Access restriction* was applied in two places. One is the circuit breaker which only the owner may trigger. The other is cancelling a trade which is only available to its creator.

Special consideration was made to prevent [this](https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit) frontrunning attack. The [mutex pattern](https://consensys.github.io/smart-contract-best-practices/known_attacks/#dos-with-block-gas-limit) was used to prevent reentrancy.

Since the contract requires a lot of external calls, e.g. for checking approval before creating a trade, it is unfortunately not possible to make all state changes before external calls.
