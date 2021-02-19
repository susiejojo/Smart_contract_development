// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract DeadManSwitch {
    address payable target_acc;
    address public owner;
    uint public block_int = 10;
    
    uint public lastcall = 0;

    event TransferBalance(address sender, uint256 amount);

    constructor() {
        target_acc = payable(0x07E032C79B7cb48dF619755426b13199FD5f8770);
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    
    // ------------------------------------------------------------------------
    // Function to be called to ensure owner is alive
    // ------------------------------------------------------------------------
    
    function stillAlive() external onlyOwner {
        lastcall = block.number;
    }
    
    // ------------------------------------------------------------------------
    // Function to send all of current account balance to target_acc
    // ------------------------------------------------------------------------

    function destroyContract() public {
        selfdestruct(target_acc);
    }
    
    function getOwner() external view returns (address) {
        return owner;
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ------------------------------------------------------------------------
    // Function to check if owner is alive
    // ------------------------------------------------------------------------
    
    function checkIfStillAlive() public returns (uint256) {
        if (
            (block.number - lastcall) < block_int && block.number >= block_int
        ) {
            destroyContract();
            return 0;
        }
        return 1;
    }

    receive() external payable onlyOwner {
        emit TransferBalance(msg.sender, msg.value);
    }
}
