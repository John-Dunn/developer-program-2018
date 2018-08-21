## Security considerations
I will be walking through the [security checklist](https://www.kingoftheether.com/contract-safety-checklist.html) as well as the list of [known attacks](https://consensys.github.io/smart-contract-best-practices/known_attacks/), analysing how the presented risks and vulnerabilities were managed in the project.

### Checklist
###### 1. Logic Bugs:
Each contract function is tested thoroughly, there are >40 tests total. The contract follows established design  patterns and relies on well-tested OpenZeppelin Code where appropriate.

###### 2. Failed Sends
The contract does not handle Ether. Potential problems in dealing with token contracts are addressed below.

###### 3. Recursive Calls / Reentrancy
Calling external contract functions is a potential security risk. External calls are made for creating, cancelling or completing a trade and call the maker and taker token contracts. If both contracts are ERC721 contracts according to spec, no reentrancy happens. If one or both of the contracts are malicious, it suffices to contain the scope of the malicious contract to the current trade (since all participating parties agreed to trust the contracts loss of their token on those contracts is not preventable). The scope of each function however is limited to the specified trade where a

###### 4. Integer Arithmetic Overflow
The only arithmetic operation is increasing the trade counter. Overflowing an uint256 by increasing it one at a time is infeasible (would take billions of years at 1 increment per millisecond).

###### 5. Poison Data
Users cannot provide malicious input in this sense as no strings are accepted anywhere (the risks of calling user-provided contracts are discussed elsewhere).

###### 6. Exposed Functions
Every variable and function has a visibility modifier. In addition the contract ABI has been double-checked to not expose any unwanted function.

###### 7. Exposed Secrets
There are no secrets.

###### 8. Denial of Service
No strings are used that could have problematic length. There are no loops or variable-cost functions that could be driven up in usage cost.

###### 9. Miner Vulnerabilities
No block timestamps or time is used.

###### 10. Malicious Creator
The contract owner has only the ability to stop the creation and completion of new trades. All withdrawals or cancellations are unaffected.

###### 11. Off-chain Safety
There is only on-chain or local computation at the moment.

###### 12. Cross-chain Replay Attacks
Not applicable.

###### 13. Tx.Origin Problem
Tx.origin is never used.

###### 14. Solidity Function Signatures and Fallback Data Collisions
There is no fallback function, therefore no risk of data collisions.

###### 15. Incorrect use of Cryptography
No homebrew crypto was used.

###### 16. Gas Limits
There is no function that loops or increases in gas costs as the contract is used.

###### 17. Stack Depth Exhaustion
Deprecated as of EIP150 (see explaination [here](https://consensys.github.io/smart-contract-best-practices/known_attacks/)).

### Known attacks
