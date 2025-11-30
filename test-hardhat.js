// Simple test to see if we can load hardhat
try {
    const hre = require("hardhat");
    console.log("✅ Hardhat loaded successfully");
    console.log("Network:", hre.network.name);
} catch (error) {
    console.error("❌ Error loading hardhat:", error.message);
    console.error("Full error:", error);
}
