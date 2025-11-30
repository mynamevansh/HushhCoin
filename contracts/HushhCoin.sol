// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HushhCoin
 * @dev Privacy-focused stablecoin with controlled minting and burning
 */
contract HushhCoin is ERC20, Ownable {
    // Reserve authority can mint tokens
    address public reserveAuthority;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);
    event TokensBurned(address indexed from, uint256 amount, uint256 timestamp);
    event ReserveAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority);
    
    /**
     * @dev Constructor initializes the token with name and symbol
     */
    constructor() ERC20("HushhCoin", "HUSHH") Ownable(msg.sender) {
        reserveAuthority = msg.sender;
    }
    
    /**
     * @dev Modifier to restrict access to owner or reserve authority
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == reserveAuthority,
            "HushhCoin: caller is not authorized"
        );
        _;
    }
    
    /**
     * @dev Mint new tokens (multiplied by 1e18 for decimals)
     * @param to Address to receive tokens
     * @param amount Amount to mint (will be multiplied by 1e18)
     */
    function mint(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0), "HushhCoin: mint to zero address");
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        
        uint256 mintAmount = amount * 1e18;
        _mint(to, mintAmount);
        
        emit TokensMinted(to, mintAmount, block.timestamp);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn (in wei, including decimals)
     */
    function burn(uint256 amount) external {
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "HushhCoin: insufficient balance");
        
        _burn(msg.sender, amount);
        
        emit TokensBurned(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Burn tokens from a specific address (requires allowance)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address from, uint256 amount) external {
        require(amount > 0, "HushhCoin: amount must be greater than 0");
        require(balanceOf(from) >= amount, "HushhCoin: insufficient balance");
        
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        
        emit TokensBurned(from, amount, block.timestamp);
    }
    
    /**
     * @dev Update reserve authority
     * @param newAuthority New reserve authority address
     */
    function setReserveAuthority(address newAuthority) external onlyOwner {
        require(newAuthority != address(0), "HushhCoin: new authority is zero address");
        
        address oldAuthority = reserveAuthority;
        reserveAuthority = newAuthority;
        
        emit ReserveAuthorityUpdated(oldAuthority, newAuthority);
    }
    
    /**
     * @dev Get total supply in human-readable format (divided by 1e18)
     */
    function totalSupplyHuman() external view returns (uint256) {
        return totalSupply() / 1e18;
    }
    
    /**
     * @dev Get balance in human-readable format (divided by 1e18)
     */
    function balanceOfHuman(address account) external view returns (uint256) {
        return balanceOf(account) / 1e18;
    }
}
