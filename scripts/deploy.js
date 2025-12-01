const hre = require("hardhat");

async function main() {
    console.log("Deploying contracts with the account:", (await hre.ethers.getSigners())[0].address);

    const HushhCoin = await hre.ethers.deployContract("HushhCoin");
    await HushhCoin.waitForDeployment();
    console.log("HushhCoin deployed at:", HushhCoin.target);

    const HushhIdentity = await hre.ethers.deployContract("HushhIdentity");
    await HushhIdentity.waitForDeployment();
    console.log("HushhIdentity deployed at:", HushhIdentity.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
