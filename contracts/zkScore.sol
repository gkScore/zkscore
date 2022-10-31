// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ZkScore
/// @author Team ZkScore
/// @notice contract to have and manage IdS & RoR

contract ZkScore is Ownable{

    //event Reputation(bytes32 root);

    constructor(){
    }

    // user address to hash root of current reputation
    mapping(address => bytes32) public userIdentityState;
    
    // user address to H(user.address, null)
    mapping(address => bytes32) public userIdentifiers;
    
    // mapping(address => uint) public scores;
    // mapping(address => uint) public totalOf;

    // hash root of all users reputation
    bytes32 public globalState;

    /**
    * @dev Conract cannot generate genesis state if user is already registered
    */
    modifier onlyNotRegister {
        require(userIdentifiers[msg.sender] == 0, "You already registered");
        _;
    }

    /**
    * @dev Conract cannot add reputation for non-registered address
    */
    modifier onlyRegister(address target) {
        require(userIdentifiers[target] != 0, "Recipients has not registered yet");
        _;
    }

    /**
    * @dev Conract cannot generate genesis state if user is already registered
    */
    function firstResister(bytes32 zeroHash) external onlyNotRegister {
        address addr = msg.sender;
        bytes32 hash = keccak256(abi.encodePacked(addr));
        userIdentifiers[addr] = hash;
        userIdentityState[addr] = _efficientHash(zeroHash, hash);
    }

    /**
    * @dev calculate root of merkel tree and update mapping state
    */
    function addReputation(address target, bytes32 hashedScore) external onlyRegister(target) {
        bytes32 reputation = _efficientHash(hashedScore, userIdentifiers[target]);
        userIdentityState[target] =  _efficientHash(userIdentityState[target], reputation);
        globalState = _efficientHash(globalState, reputation);

        //emit Reputation(reputation);
    }

    /**
    * @dev return whether the address have genesis state (registered) or not
    */
    function isRegistered(address addr) public view returns (bool) {
        return userIdentifiers[addr] != 0; 
    }

    function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value)
    {
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }

    // function test(bytes32 a, bytes32 b) public pure returns (bytes32 value){
    //     return _efficientHash(a, b);
    // }
}

//keccak256 https://qiita.com/derodero24/items/a348f62002a60dd15c83
