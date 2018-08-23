pragma solidity 0.4.24;

import "./ERC20.sol";
import "./ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Wrapper for approval and transfer of ERC721 and ERC20 token
contract WrappedToken {
    using SafeMath for uint256;

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
        if (!_isERC20) {ERC721(_contractAddress).transferFrom(_from, _to, _tokenAmountOrId);}
    }


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
            uint256 previousAllowance = token.allowance(_currentOwner, _spender);
            assert(
                ERC20(_contractAddress).approve(
                    _spender,
                    previousAllowance.add(_tokenAmountOrId)
                )
            );
        }
        if (!_isERC20) {ERC721(_contractAddress).approve(_spender, _tokenAmountOrId);}
    }
}
