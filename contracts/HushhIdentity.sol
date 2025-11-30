// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HushhIdentity
 * @dev SoulBound Token (SBT) for user identity with brand value scoring
 * One identity per wallet - tokens cannot be transferred
 */
contract HushhIdentity is ERC721, Ownable {
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Mapping from wallet address to token ID
    mapping(address => uint256) public walletToTokenId;
    
    // Mapping from wallet address to brand value score
    mapping(address => uint256) public brandValueScore;
    
    // Mapping to check if wallet has created identity
    mapping(address => bool) public hasIdentity;
    
    // Events
    event IdentityCreated(address indexed wallet, uint256 indexed tokenId, uint256 timestamp);
    event BrandScoreUpdated(address indexed wallet, uint256 oldScore, uint256 newScore, uint256 timestamp);
    
    /**
     * @dev Constructor initializes the SBT collection
     */
    constructor() ERC721("HushhIdentity", "HUSHH-ID") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @dev Create a new SoulBound identity
     * Can only be called once per wallet
     */
    function createIdentity() external {
        require(!hasIdentity[msg.sender], "HushhIdentity: identity already exists");
        require(msg.sender != address(0), "HushhIdentity: invalid address");
        
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint the SBT
        _safeMint(msg.sender, newTokenId);
        
        // Store mappings
        walletToTokenId[msg.sender] = newTokenId;
        hasIdentity[msg.sender] = true;
        brandValueScore[msg.sender] = 0; // Initialize with 0 score
        
        emit IdentityCreated(msg.sender, newTokenId, block.timestamp);
    }
    
    /**
     * @dev Set brand value score for a wallet
     * @param wallet Address to set score for
     * @param score New brand value score
     */
    function setBrandValueScore(address wallet, uint256 score) external onlyOwner {
        require(hasIdentity[wallet], "HushhIdentity: wallet has no identity");
        require(score <= 1000, "HushhIdentity: score must be <= 1000");
        
        uint256 oldScore = brandValueScore[wallet];
        brandValueScore[wallet] = score;
        
        emit BrandScoreUpdated(wallet, oldScore, score, block.timestamp);
    }
    
    /**
     * @dev Get brand value score for a wallet
     * @param wallet Address to query
     */
    function getBrandValueScore(address wallet) external view returns (uint256) {
        require(hasIdentity[wallet], "HushhIdentity: wallet has no identity");
        return brandValueScore[wallet];
    }
    
    /**
     * @dev Get token ID for a wallet
     * @param wallet Address to query
     */
    function getTokenId(address wallet) external view returns (uint256) {
        require(hasIdentity[wallet], "HushhIdentity: wallet has no identity");
        return walletToTokenId[wallet];
    }
    
    /**
     * @dev Check if wallet has an identity
     * @param wallet Address to check
     */
    function checkIdentity(address wallet) external view returns (bool) {
        return hasIdentity[wallet];
    }
    
    /**
     * @dev Get total number of identities created
     */
    function totalIdentities() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Override transfer functions to make tokens non-transferable (SoulBound)
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        virtual 
        override 
        returns (address) 
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Block all transfers (from != address(0) && to != address(0))
        // Allow burning if needed (to == address(0))
        if (from != address(0) && to != address(0)) {
            revert("HushhIdentity: SoulBound tokens cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Disable approvals for SoulBound tokens
     */
    function approve(address, uint256) public virtual override {
        revert("HushhIdentity: SoulBound tokens cannot be approved");
    }
    
    /**
     * @dev Disable setApprovalForAll for SoulBound tokens
     */
    function setApprovalForAll(address, bool) public virtual override {
        revert("HushhIdentity: SoulBound tokens cannot be approved");
    }
}
