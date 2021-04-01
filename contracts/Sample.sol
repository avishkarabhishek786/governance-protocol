pragma solidity ^0.5.16; 

contract Sample {
    
    uint foo = 99;
    bool bar = false;
    
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    
    function getVal() public view returns(uint, bool) {
        return (foo, bar);
    }
    
    function setVal(uint _foo, bool _bar) public {
        foo = _foo;
        bar = _bar;
    }
    
}