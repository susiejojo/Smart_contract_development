// SPDX-License-Identifier: GPL-3.0
    
pragma solidity >=0.4.22 <0.8.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "remix_accounts.sol";
import "../contracts/1_Storage.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {
    Storage new_storage;
    
    function beforeAll () public {
        new_storage = new Storage();
    }
    
    function checkSuccess() public {
        new_storage.store(uint(5));
        Assert.equal(new_storage.retrieve(), uint(5), "should be equal");
    }

    
    function checkFailure() public {
        Assert.equal(new_storage.retrieve(), uint(45), "should not be equal");
    }

}
