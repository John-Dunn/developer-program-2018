## Security considerations
I will be walking through the [security checklist](https://www.kingoftheether.com/contract-safety-checklist.html), analysing how the presented risks and vulnerabilities were managed in the project. I focus on the contracts `Etherary.sol` and `TokenInterface.sol`. The token faucets are only a couple of lines of code and basically just inherit from OpenZeppelin token contracts (nonetheless there are some tests for them).

The main vulnerability is the ability for users to enter arbitrary, potentially malicious contracts. The main security consideration here was to limit the scope of any attack to the two involved contracts. The main risk is one contract being malicious and the other legitimate, e.g. a malicious contract trading for legitimate ERC20 token in an attempt to drain those funds. In the following I will describe the countermeasures I took to prevent this.  

### Checklist
###### 1. Logic Bugs:
Each contract function is tested thoroughly, there are over 100 tests total, checking each combination of token in a trade as well as wrong inputs. The contract follows established design patterns and relies on well-tested OpenZeppelin Code where appropriate (e.g. SafeMath and the token contracts).

###### 2. Failed Sends
The contract does not handle Ether. Potential problems in dealing with token contracts are addressed below.

###### 3. Recursive Calls / Reentrancy
Calling external contract functions is a potential security risk. External calls are made for creating, cancelling or completing a trade and call the maker and taker token contracts. Reentrancy has been prevented using a mutex pattern similar to the description [here](https://consensys.github.io/smart-contract-best-practices/known_attacks/#dos-with-block-gas-limit).


###### 4. Integer Arithmetic Overflow
The only arithmetic operation in `Etherary.sol` is increasing the trade counter. Overflowing an uint256 by increasing it one at a time is infeasible (would take billions of years at 1 increment per millisecond). In `TokenInterface.sol` another arithmetic operation is performed to increase ERC20 token allowance. The SafeMath library is used here.

###### 5. Poison Data
User input data is only provided when creating a trade. Several requirements are checked to ensure the input data is as correct as it can be. This does not however prevent from users inputting malicious token contracts.  

###### 6. Exposed Functions
Every variable and function has a visibility modifier. In addition the contract ABI has been double-checked to not expose any unwanted functions.

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

###### Other
Not mentioned on the checklist is frontrunning. Especially when dealing with token allowances this may be dangerous (see [here](https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit)). This has been prevented in `TokenInterface.sol` by only adding to the previous allowance, not setting it.
