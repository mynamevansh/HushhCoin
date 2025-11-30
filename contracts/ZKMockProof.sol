// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZKMockProof
 * @dev Mock Zero-Knowledge Proof system for demonstrating privacy-preserving score verification
 * In production, this would be replaced with actual ZK-SNARK circuits (e.g., using Circom + SnarkJS)
 */
contract ZKMockProof is Ownable {
    
    // Proof structure
    struct Proof {
        address prover;
        string statement;
        uint256 timestamp;
        bool verified;
    }
    
    // Store proofs by ID
    mapping(uint256 => Proof) public proofs;
    uint256 private _proofIdCounter;
    
    // Store proof IDs by address
    mapping(address => uint256[]) public userProofs;
    
    // Events
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
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        _proofIdCounter = 1;
    }
    
    /**
     * @dev Generate a mock ZK proof based on score
     * @param score The brand value score to generate proof for
     * @return proofId The ID of the generated proof
     * @return statement The privacy-preserving statement
     */
    function generateProof(uint256 score) external returns (uint256 proofId, string memory statement) {
        require(score <= 1000, "ZKMockProof: score must be <= 1000");
        
        proofId = _proofIdCounter;
        _proofIdCounter++;
        
        // Generate privacy-preserving statement based on score ranges
        statement = _generateStatement(score);
        
        // Store proof
        proofs[proofId] = Proof({
            prover: msg.sender,
            statement: statement,
            timestamp: block.timestamp,
            verified: true // Auto-verify for mock
        });
        
        // Add to user's proof list
        userProofs[msg.sender].push(proofId);
        
        emit ProofGenerated(proofId, msg.sender, statement, block.timestamp);
        
        return (proofId, statement);
    }
    
    /**
     * @dev Generate privacy-preserving statement based on score
     * @param score The score to generate statement for
     */
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
    
    /**
     * @dev Verify a proof (mock verification - always returns true if proof exists)
     * @param proofId The ID of the proof to verify
     */
    function verifyProof(uint256 proofId) external returns (bool) {
        require(proofId < _proofIdCounter, "ZKMockProof: proof does not exist");
        
        Proof storage proof = proofs[proofId];
        
        emit ProofVerified(proofId, msg.sender, proof.verified, block.timestamp);
        
        return proof.verified;
    }
    
    /**
     * @dev Get proof details
     * @param proofId The ID of the proof
     */
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
    
    /**
     * @dev Get all proof IDs for a user
     * @param user The address to query
     */
    function getUserProofs(address user) external view returns (uint256[] memory) {
        return userProofs[user];
    }
    
    /**
     * @dev Get total number of proofs generated
     */
    function totalProofs() external view returns (uint256) {
        return _proofIdCounter - 1;
    }
    
    /**
     * @dev Generate a batch of proofs for demonstration
     * @param scores Array of scores to generate proofs for
     */
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
