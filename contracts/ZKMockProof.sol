// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKMockProof is Ownable {
    
    struct Proof {
        address prover;
        string statement;
        uint256 timestamp;
        bool verified;
    }
    
    mapping(uint256 => Proof) public proofs;
    uint256 private _proofIdCounter;
    
    mapping(address => uint256[]) public userProofs;
    
    event ProofGenerated(
        uint256 indexed proofId,
        address indexed prover,
        string statement,
        uint256 timestamp
    );
    
    event ProofVerified(
        uint256 indexed proofId,
        address indexed verifier,
        bool result,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {
        _proofIdCounter = 1;
    }
    
    function generateProof(uint256 score) external returns (uint256 proofId, string memory statement) {
        require(score <= 1000, "ZKMockProof: score must be <= 1000");
        
        proofId = _proofIdCounter;
        _proofIdCounter++;
        
        statement = _generateStatement(score);
        
        proofs[proofId] = Proof({
            prover: msg.sender,
            statement: statement,
            timestamp: block.timestamp,
            verified: true
        });
        
        userProofs[msg.sender].push(proofId);
        
        emit ProofGenerated(proofId, msg.sender, statement, block.timestamp);
        
        return (proofId, statement);
    }
    
    function _generateStatement(uint256 score) private pure returns (string memory) {
        if (score >= 900) {
            return "Score: Excellent (900+) - Premium Tier";
        } else if (score >= 800) {
            return "Score: Very Good (800-899) - Gold Tier";
        } else if (score >= 700) {
            return "Score: Good (700-799) - Silver Tier";
        } else if (score >= 600) {
            return "Score: Above Average (600-699) - Bronze Tier";
        } else if (score >= 500) {
            return "Score: Average (500-599) - Standard Tier";
        } else if (score >= 400) {
            return "Score: Below Average (400-499)";
        } else if (score >= 300) {
            return "Score: Low (300-399)";
        } else if (score >= 200) {
            return "Score: Very Low (200-299)";
        } else if (score >= 100) {
            return "Score: Minimal (100-199)";
        } else {
            return "Score: Unrated (0-99)";
        }
    }
    
    function verifyProof(uint256 proofId) external returns (bool) {
        require(proofId < _proofIdCounter, "ZKMockProof: proof does not exist");
        
        Proof storage proof = proofs[proofId];
        
        emit ProofVerified(proofId, msg.sender, proof.verified, block.timestamp);
        
        return proof.verified;
    }
    
    function getProof(uint256 proofId) external view returns (
        address prover,
        string memory statement,
        uint256 timestamp,
        bool verified
    ) {
        require(proofId < _proofIdCounter, "ZKMockProof: proof does not exist");
        
        Proof memory proof = proofs[proofId];
        return (proof.prover, proof.statement, proof.timestamp, proof.verified);
    }
    
    function getUserProofs(address user) external view returns (uint256[] memory) {
        return userProofs[user];
    }
    
    function totalProofs() external view returns (uint256) {
        return _proofIdCounter - 1;
    }
    
    function batchGenerateProofs(uint256[] calldata scores) external returns (uint256[] memory proofIds) {
        proofIds = new uint256[](scores.length);
        
        for (uint256 i = 0; i < scores.length; i++) {
            require(scores[i] <= 1000, "ZKMockProof: score must be <= 1000");
            
            uint256 proofId = _proofIdCounter;
            _proofIdCounter++;
            
            string memory statement = _generateStatement(scores[i]);
            
            proofs[proofId] = Proof({
                prover: msg.sender,
                statement: statement,
                timestamp: block.timestamp,
                verified: true
            });
            
            userProofs[msg.sender].push(proofId);
            proofIds[i] = proofId;
            
            emit ProofGenerated(proofId, msg.sender, statement, block.timestamp);
        }
        
        return proofIds;
    }
}
