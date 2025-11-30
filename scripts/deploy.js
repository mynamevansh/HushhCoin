const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting HUSHHcoin deployment...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

    // Deploy HushhCoin
    console.log("📝 Deploying HushhCoin...");
    const HushhCoin = await hre.ethers.getContractFactory("HushhCoin");
    const hushhCoin = await HushhCoin.deploy();
    await hushhCoin.waitForDeployment();
    const hushhCoinAddress = await hushhCoin.getAddress();
    console.log("✅ HushhCoin deployed to:", hushhCoinAddress);

    // Deploy HushhIdentity
    console.log("\n📝 Deploying HushhIdentity...");
    const HushhIdentity = await hre.ethers.getContractFactory("HushhIdentity");
    const hushhIdentity = await HushhIdentity.deploy();
    await hushhIdentity.waitForDeployment();
    const hushhIdentityAddress = await hushhIdentity.getAddress();
    console.log("✅ HushhIdentity deployed to:", hushhIdentityAddress);

    // Deploy ZKMockProof
    console.log("\n📝 Deploying ZKMockProof...");
    const ZKMockProof = await hre.ethers.getContractFactory("ZKMockProof");
    const zkMockProof = await ZKMockProof.deploy();
    await zkMockProof.waitForDeployment();
    const zkMockProofAddress = await zkMockProof.getAddress();
    console.log("✅ ZKMockProof deployed to:", zkMockProofAddress);

    // Wait for block confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await hushhCoin.deploymentTransaction().wait(5);
    await hushhIdentity.deploymentTransaction().wait(5);
    await zkMockProof.deploymentTransaction().wait(5);

    // Save deployment addresses
    const fs = require("fs");
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            HushhCoin: hushhCoinAddress,
            HushhIdentity: hushhIdentityAddress,
            ZKMockProof: zkMockProofAddress
        }
    };

    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    fs.writeFileSync(
        `${deploymentsDir}/${hre.network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to:", `${deploymentsDir}/${hre.network.name}.json`);

    // Export ABIs for frontend
    const artifactsDir = "./artifacts/contracts";
    const frontendAbiDir = "./frontend/src/contracts";

    if (!fs.existsSync(frontendAbiDir)) {
        fs.mkdirSync(frontendAbiDir, { recursive: true });
    }

    // Copy ABIs
    const contracts = ["HushhCoin", "HushhIdentity", "ZKMockProof"];
    contracts.forEach(contractName => {
        const artifact = require(`${artifactsDir}/${contractName}.sol/${contractName}.json`);
        fs.writeFileSync(
            `${frontendAbiDir}/${contractName}.json`,
            JSON.stringify({ abi: artifact.abi, address: deploymentInfo.contracts[contractName] }, null, 2)
        );
    });

    console.log("✅ ABIs exported to frontend\n");

    // Print summary
    console.log("═══════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("═══════════════════════════════════════════════");
    console.log("\n📋 Contract Addresses:");
    console.log("   HushhCoin:     ", hushhCoinAddress);
    console.log("   HushhIdentity: ", hushhIdentityAddress);
    console.log("   ZKMockProof:   ", zkMockProofAddress);
    console.log("\n🔗 Network:", hre.network.name);
    console.log("🆔 Chain ID:", deploymentInfo.chainId);
    console.log("\n💡 Next Steps:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Update frontend with contract addresses");
    console.log("   3. Test contract interactions");
    console.log("═══════════════════════════════════════════════\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
