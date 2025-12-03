// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HushhCoin is ERC20, Ownable {
    address public reserveAuthority;
    
    event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);
    event TokensBurned(address indexed from, uint256 amount, uint256 timestamp);
    event ReserveAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority);
    
    constructor() ERC20("HushhCoin", "HUSHH") Ownable(msg.sender) {
        reserveAuthority = msg.sender;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == reserveAuthority,
            "HushhCoin: caller is not authorized"
        );
        _;
    }
    
    function mint(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0), "HushhCoin: mint to zero address");
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        
        uint256 mintAmount = amount * 1e18;
        _mint(to, mintAmount);
        
        emit TokensMinted(to, mintAmount, block.timestamp);
    }
    
    function burn(uint256 amount) external {
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "HushhCoin: insufficient balance");
        
        _burn(msg.sender, amount);
        
        emit TokensBurned(msg.sender, amount, block.timestamp);
    }
    
    function burnFrom(address from, uint256 amount) external {
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        require(balanceOf(from) >= amount, "HushhCoin: insufficient balance");
        
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        
        emit TokensBurned(from, amount, block.timestamp);
    }
    
    function setReserveAuthority(address newAuthority) external onlyOwner {
        require(newAuthority != address(0), "HushhCoin: new authority is zero address");
        
        address oldAuthority = reserveAuthority;
        reserveAuthority = newAuthority;
        
        emit ReserveAuthorityUpdated(oldAuthority, newAuthority);
    }
    
    function totalSupplyHuman() external view returns (uint256) {
        return totalSupply() / 1e18;
    }
    
    function balanceOfHuman(address account) external view returns (uint256) {
        return balanceOf(account) / 1e18;
    }
}
