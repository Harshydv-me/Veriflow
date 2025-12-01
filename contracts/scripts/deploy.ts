import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of Blue Carbon Registry System...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("");

  // Deploy CarbonCreditToken
  console.log("Deploying CarbonCreditToken...");
  const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
  const carbonToken = await CarbonCreditToken.deploy();
  await carbonToken.waitForDeployment();
  const carbonTokenAddress = await carbonToken.getAddress();
  console.log("✓ CarbonCreditToken deployed to:", carbonTokenAddress);
  console.log("");

  // Deploy BlueCarbonRegistry
  console.log("Deploying BlueCarbonRegistry...");
  const BlueCarbonRegistry = await ethers.getContractFactory("BlueCarbonRegistry");
  const registry = await BlueCarbonRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✓ BlueCarbonRegistry deployed to:", registryAddress);
  console.log("");

  // Deploy BlueCarbonVerification
  console.log("Deploying BlueCarbonVerification...");
  const BlueCarbonVerification = await ethers.getContractFactory("BlueCarbonVerification");
  const verification = await BlueCarbonVerification.deploy(
    carbonTokenAddress,
    registryAddress
  );
  await verification.waitForDeployment();
  const verificationAddress = await verification.getAddress();
  console.log("✓ BlueCarbonVerification deployed to:", verificationAddress);
  console.log("");

  // Grant MINTER_ROLE to verification contract
  console.log("Setting up roles...");
  const MINTER_ROLE = await carbonToken.MINTER_ROLE();
  const VERIFIER_ROLE = await registry.VERIFIER_ROLE();

  await carbonToken.grantRole(MINTER_ROLE, verificationAddress);
  console.log("✓ Granted MINTER_ROLE to BlueCarbonVerification");

  await registry.grantRole(VERIFIER_ROLE, verificationAddress);
  console.log("✓ Granted VERIFIER_ROLE to BlueCarbonVerification");

  await verification.grantRole(VERIFIER_ROLE, deployer.address);
  console.log("✓ Granted VERIFIER_ROLE to deployer");
  console.log("");

  // Print summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("");
  console.log("Deployed Contracts:");
  console.log("  CarbonCreditToken:        ", carbonTokenAddress);
  console.log("  BlueCarbonRegistry:       ", registryAddress);
  console.log("  BlueCarbonVerification:   ", verificationAddress);
  console.log("");
  console.log("Save these addresses to your .env files!");
  console.log("=".repeat(60));
  console.log("");

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CarbonCreditToken: carbonTokenAddress,
      BlueCarbonRegistry: registryAddress,
      BlueCarbonVerification: verificationAddress,
    },
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✓ Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
