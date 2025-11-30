# HUSHHcoin Deployment Guide

## ⚠️ Important: OneDrive Path Issue

**CRITICAL**: If you're running this project from OneDrive, you will encounter Hardhat module resolution errors.

### Solution Options:

#### Option 1: Move Project (Recommended)
```powershell
# Move the entire project to a local directory
Move-Item "C:\Users\vansh\OneDrive\Desktop\hushh" "C:\Projects\hushh"
cd C:\Projects\hushh
npm install
npx hardhat compile
```

#### Option 2: Disable OneDrive Sync for this folder
1. Right-click the `hushh` folder
2. Select "Always keep on this device"
3. Restart your terminal
4. Run `npm install` again

#### Option 3: Use WSL (Windows Subsystem for Linux)
```bash
# In WSL
cd /mnt/c/Projects
git clone <your-repo>
cd hushh
npm install
npx hardhat compile
```

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Project moved out of OneDrive (if applicable)
- [ ] Dependencies installed (`npm install`)
- [ ] Contracts compile successfully (`npm run compile`)
- [ ] Tests pass (`npm test`)
- [ ] `.env` file configured with private key and RPC URLs

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
# Testnet RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY

# Deployer Private Key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Keys (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Getting RPC URLs

#### Alchemy (Recommended)
1. Visit https://www.alchemy.com/
2. Create a free account
3. Create a new app for Sepolia or Mumbai
4. Copy the HTTPS URL

#### Infura
1. Visit https://infura.io/
2. Create a free account
3. Create a new project
4. Copy the endpoint URL

### Getting Your Private Key

**⚠️ SECURITY WARNING**: Never share or commit your private key!

From MetaMask:
1. Click the three dots menu
2. Account Details → Show Private Key
3. Enter your password
4. Copy the private key

## 🚀 Deployment Steps

### 1. Local Deployment (Testing)

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npm run deploy

# The deployment will output contract addresses
```

### 2. Testnet Deployment

#### Sepolia Testnet

```bash
# Get testnet ETH from faucet
# Visit: https://sepoliafaucet.com/

# Deploy to Sepolia
npm run deploy -- --network sepolia

# Save the contract addresses from output
```

#### Mumbai Testnet

```bash
# Get testnet MATIC from faucet
# Visit: https://faucet.polygon.technology/

# Deploy to Mumbai
npm run deploy -- --network mumbai

# Save the contract addresses from output
```

### 3. Verify Deployment

After deployment, you'll see output like:

```
═══════════════════════════════════════════════
🎉 DEPLOYMENT COMPLETE!
═══════════════════════════════════════════════

📋 Contract Addresses:
   HushhCoin:      0x1234...
   HushhIdentity:  0x5678...
   ZKMockProof:    0x9abc...

🔗 Network: sepolia
🆔 Chain ID: 11155111
```

**Save these addresses!** You'll need them for:
- Frontend configuration
- Contract verification
- Testing and interaction

## 🔍 Contract Verification

### Verify on Etherscan (Sepolia)

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS

# Example:
npx hardhat verify --network sepolia 0x1234567890abcdef1234567890abcdef12345678
```

### Verify on Polygonscan (Mumbai)

```bash
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS
```

## 📝 Post-Deployment Tasks

### 1. Update Frontend Configuration

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_HUSHHCOIN_ADDRESS=0x...
NEXT_PUBLIC_HUSHHIDENTITY_ADDRESS=0x...
NEXT_PUBLIC_ZKMOCKPROOF_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
```

### 2. Export ABIs to Frontend

The deployment script automatically exports ABIs to `frontend/src/contracts/`.

If needed, manually copy:

```bash
# From project root
cp artifacts/contracts/HushhCoin.sol/HushhCoin.json frontend/contracts/
cp artifacts/contracts/HushhIdentity.sol/HushhIdentity.json frontend/contracts/
cp artifacts/contracts/ZKMockProof.sol/ZKMockProof.json frontend/contracts/
```

### 3. Test Contract Interactions

```bash
# Start Hardhat console
npx hardhat console --network sepolia

# In console:
const HushhCoin = await ethers.getContractFactory("HushhCoin");
const hushhCoin = await HushhCoin.attach("YOUR_DEPLOYED_ADDRESS");
const balance = await hushhCoin.balanceOf("YOUR_WALLET_ADDRESS");
console.log("Balance:", balance.toString());
```

### 4. Initialize Contracts (if needed)

Some contracts may require initialization:

```javascript
// Mint initial supply
await hushhCoin.mint(yourAddress, 1000);

// Create identity
await hushhIdentity.createIdentity();

// Set brand score
await hushhIdentity.setBrandValueScore(yourAddress, 750);
```

## 🧪 Testing Deployment

### Manual Testing Checklist

- [ ] HushhCoin deployed successfully
- [ ] HushhIdentity deployed successfully
- [ ] ZKMockProof deployed successfully
- [ ] Can mint tokens
- [ ] Can burn tokens
- [ ] Can create identity
- [ ] Can set brand score
- [ ] Can generate proofs
- [ ] Frontend connects to contracts
- [ ] All contract functions work as expected

### Automated Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/hushhcoin.test.js

# Run with gas reporting
REPORT_GAS=true npm test
```

## 📊 Monitoring and Maintenance

### View on Block Explorer

- **Sepolia**: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
- **Mumbai**: https://mumbai.polygonscan.com/address/YOUR_CONTRACT_ADDRESS

### Monitor Events

```javascript
// Listen for minting events
hushhCoin.on("TokensMinted", (to, amount, timestamp) => {
  console.log(`Minted ${amount} tokens to ${to}`);
});
```

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   - Add to `.gitignore`
   - Use `.env.example` for templates

2. **Use separate wallets**
   - Development wallet for testing
   - Production wallet for mainnet

3. **Audit contracts before mainnet**
   - Get professional audit
   - Run security tools (Slither, Mythril)

4. **Set up multi-sig for ownership**
   - Use Gnosis Safe
   - Require multiple signatures for critical operations

5. **Monitor contract activity**
   - Set up alerts for large transactions
   - Monitor for unusual patterns

## 🐛 Common Issues

### "Insufficient funds"
- Get testnet tokens from faucet
- Check you're on the correct network

### "Nonce too high"
- Reset MetaMask account
- Or wait for pending transactions

### "Contract not deployed"
- Verify deployment was successful
- Check you're using correct network
- Confirm contract address is correct

### "Gas estimation failed"
- Check function parameters
- Ensure you have enough balance
- Verify contract state allows the operation

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethereum Testnet Faucets](https://faucetlink.to/)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Etherscan](https://etherscan.io/)

## 🚀 Next Steps

After successful deployment:

1. **Launch Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test User Flows**
   - Connect wallet
   - Create identity
   - Mint tokens
   - Generate proofs

3. **Document Contract Addresses**
   - Save in project README
   - Share with team
   - Update documentation

4. **Plan Mainnet Deployment**
   - Get security audit
   - Prepare launch strategy
   - Set up monitoring

## 📞 Support

For deployment issues:
1. Check this guide thoroughly
2. Review Hardhat documentation
3. Check project GitHub issues
4. Ask in project Discord/Telegram

---

**Remember**: Always test thoroughly on testnet before considering mainnet deployment!
