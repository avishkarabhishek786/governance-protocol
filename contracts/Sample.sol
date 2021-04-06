// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; 

contract Sample {
    
    uint256 foo = 99;
    bool bar = false;
    
    function getVal() public view returns(uint256) {
        return foo;
    }
    
    function setVal(uint256 _foo) public {
        foo = _foo;
    }
    
}