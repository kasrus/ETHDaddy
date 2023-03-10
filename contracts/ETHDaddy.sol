// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETHDaddy is ERC721 {
    uint256 public maxSupply;
    uint256 public totalSupply;
    address public owner;

    struct Domain {
        string name;
        uint256 cost;
        bool isOwned;
    }
    mapping(uint256 => Domain) public domains;

    modifier onlyOwner() {
        require(msg.sender == owner, "must be owner");
        _;
    }

    // TODO:
    // 1. List domains
    // 2. Buy domains
    // 3. Get paid fees whenever someone buys a domain
    constructor(string memory _name, string memory _symbol) 
        ERC721(_name, _symbol) {
            owner = msg.sender; //the deployer
    }   

    function list(string memory _name, uint256 _cost) public onlyOwner{
        maxSupply += 1;
        domains[maxSupply] = Domain(_name, _cost, false);
        //isOwned is set to false as when we list, we only list domains
        //that are not purchased yet
        // Model a domain
        // Save the domain
        // Update total domain count
    }

    function mint(uint256 _id) public payable {
        require(_id != 0);
        require(_id <= maxSupply);
        require(domains[_id].isOwned == false);
        require(msg.value >= domains[_id].cost);

        domains[_id].isOwned = true;
        totalSupply++;
         
        _safeMint(msg.sender, _id);
    }

    function getDomain(uint256 _id) public view returns (Domain memory) {
        return domains[_id];
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}

