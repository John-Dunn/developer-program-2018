pragma solidity 0.4.24;

import "./ERC20.sol";
import "./ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/// @title Wrapping related ERC20 and ERC721 functions to provide a uniform interface
// Allows to call all functions required by the main contract (checking balance,
// approval/allowance status, approving someone) uniformly.

contract TokenInterface {
    using SafeMath for uint256;

    /** @dev Check whether caller owns the specified token on the specified contract. In case of
      *      ERC20 contracts checks whether the caller has sufficient balance, for ERC721 checks
      *      whether the caller is the token owner.
      * @param _contractAddress Contract address where ownership is to be verified on
      * @param _isERC20 Whether contract above is ERC20 (true) or ERC721 (false)
      * @param _caller Account whose balance/ownership is to be checked
      * @param _tokenAmountOrId Token ID (ERC721) or amount (ERC20) that caller should own
      *
      * @return Whether the token is owned by _caller
      */
    function isOwned (
        address _contractAddress,
        bool _isERC20,
        address _caller,
        uint256 _tokenAmountOrId
    )
        internal
        view
        returns (bool)
    {
        if (_isERC20) {return ERC20(_contractAddress).balanceOf(_caller) >= _tokenAmountOrId;}
        if (!_isERC20) {return ERC721(_contractAddress).ownerOf(_tokenAmountOrId) == _caller;}
    }

    /** @dev Check whether caller has approved the main contract to transfer the token. In case of
      *      ERC20 contracts checks whether the main contract has sufficient allowance, for ERC721
      *      checks whether the main contract is approved.
      * @param _contractAddress Contract address where allowance/approval is to be verified
      * @param _isERC20 Whether contract above is ERC20 (true) or ERC721 (false)
      * @param _caller Account that should have granted allowance/approval
      * @param _spender Account that should have been approved (main contract)
      * @param _tokenAmountOrId Token ID (ERC721) or amount (ERC20) that should be approved
      *
      * @return Whether the token is owned by _caller
      */
    function isApproved (
        address _contractAddress,
        bool _isERC20,
        address _caller,
        address _spender,
        uint256 _tokenAmountOrId
    )
        internal
        view
        returns (bool)
    {
        if (_isERC20) {
            return ERC20(_contractAddress).allowance(_caller, _spender) >= _tokenAmountOrId;
        }
        if (!_isERC20) {
            return ERC721(_contractAddress).getApproved(_tokenAmountOrId) == _spender;
        }
    }

    /** @dev Transfers token
      * @param _contractAddress Contract address where token are transferred
      * @param _isERC20 Whether contract above is ERC20 (true) or ERC721 (false)
      * @param _from Account that owns the token currently (maker or taker of a trade)
      * @param _to Account that will own the token (main contract)
      * @param _tokenAmountOrId Token ID (ERC721) or amount (ERC20) that is transferred
      */
    function transferFrom (
        address _contractAddress,
        bool _isERC20,
        address _from,
        address _to,
        uint256 _tokenAmountOrId
    )
        internal
    {
        if (_isERC20) {assert(ERC20(_contractAddress).transferFrom(_from, _to, _tokenAmountOrId));}
        if (!_isERC20) {ERC721(_contractAddress).safeTransferFrom(_from, _to, _tokenAmountOrId);}
    }

    /** @dev Approves transfer of token (used when trade is completed to allow players to
      *      withdraw). For ERC20 token the allowance is increased, for ERC721 the token is
      *     approved.
      * @param _contractAddress Contract address where token is approved
      * @param _isERC20 Whether contract above is ERC20 (true) or ERC721 (false)
      * @param _spender Account that will be allowed to transfer the token
      * @param _tokenAmountOrId Token ID (ERC721) or amount (ERC20) that is approved
      * @param _currentOwner Account doing the approving (main contract)
      */
    function approve (
        address _contractAddress,
        bool _isERC20,
        address _spender,
        uint256 _tokenAmountOrId,
        address _currentOwner
    )
        internal
    {
        if (_isERC20) {
            ERC20 token = ERC20(_contractAddress);
            /// @ dev Avoids allowance frontrunning, see https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
            uint256 previousAllowance = token.allowance(_currentOwner, _spender);
            assert(
                ERC20(_contractAddress).approve(_spender,previousAllowance.add(_tokenAmountOrId))
            );
        }
        if (!_isERC20) {ERC721(_contractAddress).approve(_spender, _tokenAmountOrId);}
    }
}
