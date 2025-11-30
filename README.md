# HUSHHcoin - Privacy-Focused Stablecoin MVP

A privacy-focused stablecoin with SoulBound identity and brand value scoring system.

## 🚀 Features

- **HushhCoin (HUSHH)**: ERC-20 stablecoin with controlled minting/burning
- **SoulBound Identity**: Non-transferable NFT-based identity system
- **Brand Value Score**: Privacy-preserving reputation scoring (0-1000)
- **ZK Mock Proofs**: Zero-knowledge proof demonstration for score verification

## 📋 Smart Contracts

### HushhCoin.sol
- ERC-20 token with 18 decimals
- Owner and Reserve Authority can mint tokens
- Users can burn their own tokens
- Events for all minting/burning operations

### HushhIdentity.sol
- ERC-721 based SoulBound Token (SBT)
- One identity per wallet address
- Non-transferable (cannot be sold or transferred)
- Brand value score (0-1000) attached to each identity
- Owner can update brand scores

### ZKMockProof.sol
- Mock zero-knowledge proof system
- Generates privacy-preserving statements based on score ranges
- Proof verification (mock implementation)
- Batch proof generation support

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Hardhat + Chai
- **Frontend**: React/Next.js (coming soon)
- **Web3**: Ethers.js v6

## 📦 Installation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npx hardhat node
npm run deploy

# Deploy to testnet (Sepolia or Mumbai)
npm run deploy -- --network sepolia
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_private_key_here
```

## 📝 Contract Addresses

After deployment, contract addresses will be saved in `./deployments/[network].json`

## 🧪 Testing

The project includes comprehensive tests for all contracts:

- `test/hushhcoin.test.js`: HushhCoin functionality tests
- `test/identity.test.js`: SoulBound Identity tests
- `test/zkproof.test.js`: ZK Mock Proof tests

Run tests with:
```bash
npm test
```

## 🌐 Supported Networks

- **Local**: Hardhat Network (chainId: 1337)
- **Testnet**: Sepolia (chainId: 11155111)
- **Testnet**: Mumbai (chainId: 80001)

## 📖 Usage Examples

### Minting HushhCoin
```javascript
const hushhCoin = await ethers.getContractAt("HushhCoin", address);
await hushhCoin.mint(recipientAddress, 1000); // Mints 1000 HUSHH
```

### Creating Identity
```javascript
const hushhIdentity = await ethers.getContractAt("HushhIdentity", address);
await hushhIdentity.createIdentity(); // Creates SoulBound ID
```

### Generating ZK Proof
```javascript
const zkProof = await ethers.getContractAt("ZKMockProof", address);
const [proofId, statement] = await zkProof.generateProof(750);
console.log(statement); // "Score: Good (700-799) - Silver Tier"
```

## 🔐 Security Features

- **Access Control**: Owner and Reserve Authority roles
- **SoulBound Tokens**: Non-transferable identity NFTs
- **Privacy**: Score ranges instead of exact scores
- **Event Logging**: All critical operations emit events

## 🚧 Roadmap

- [x] Smart contract development
- [x] Unit tests
- [x] Deployment scripts
- [ ] Frontend dashboard
- [ ] Real ZK-SNARK implementation
- [ ] Mainnet deployment
- [ ] Mobile app

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This is an MVP prototype for demonstration purposes. Do not use in production without proper auditing and security reviews.

## 🐛 Known Issues

- **OneDrive Path Issue**: If you're running this project from OneDrive, you may encounter module resolution issues with Hardhat. Solution: Move the project to a local directory (e.g., `C:\Projects\hushh`)

## 📞 Support

For issues and questions, please open an issue on GitHub.
