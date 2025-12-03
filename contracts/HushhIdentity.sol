// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HushhIdentity is ERC721, Ownable {

    uint256 private _tokenIdCounter;

    mapping(address => uint256) public walletToTokenId;
    mapping(address => bool) public hasIdentity;
    mapping(address => uint256) public brandValueScore;

    // 🔥 NEW — Brand Access Roles
    mapping(address => bool) public isBrand;

    // 🔥 NEW — Public scoring mode toggle
    bool public publicScoringEnabled = false;

    event IdentityCreated(address wallet,uint256 tokenId,uint256 time);
    event ScoreUpdated(address wallet,uint256 oldScore,uint256 newScore,uint256 time);
    event BrandAdded(address indexed brand);
    event BrandRemoved(address indexed brand);
    event PublicModeEnabled(bool status);

    constructor() ERC721("HushhIdentity","HUSHH-ID") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }

    function mintIdentity() external {
        require(!hasIdentity[msg.sender],"Identity exists");
        uint256 id=_tokenIdCounter++;
        _safeMint(msg.sender,id);
        walletToTokenId[msg.sender]=id;
        hasIdentity[msg.sender]=true;

        emit IdentityCreated(msg.sender,id,block.timestamp);
    }

    // 🔥 Score rules: Owner OR approved brand OR public-if-enabled
    modifier canScore(address wallet) {
        require(hasIdentity[wallet],"No identity");
        require(
            msg.sender==owner() || isBrand[msg.sender] || publicScoringEnabled,
            "Not allowed to score user"
        );
        _;
    }

    function setBrandValueScore(address wallet,uint256 score) external canScore(wallet) {
        require(score<=1000,"<=1000");
        uint256 old=brandValueScore[wallet];
        brandValueScore[wallet]=score;
        emit ScoreUpdated(wallet,old,score,block.timestamp);
    }

    // 🔥 ADMIN PANEL
    function addBrand(address brand) external onlyOwner {
        isBrand[brand]=true;
        emit BrandAdded(brand);
    }

    function removeBrand(address brand) external onlyOwner {
        isBrand[brand]=false;
        emit BrandRemoved(brand);
    }

    function togglePublicMode(bool status) external onlyOwner {
        publicScoringEnabled=status;
        emit PublicModeEnabled(status);
    }

    function getBrandValueScore(address wallet) external view returns(uint256){
        return brandValueScore[wallet];
    }

    function checkIdentity(address wallet) external view returns(bool){
        return hasIdentity[wallet];
    }
}
