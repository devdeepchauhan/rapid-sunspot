import { ethers, network } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying CertificateManager...");
  const CertificateManager = await ethers.getContractFactory("CertificateManager");
  const certManager = await CertificateManager.deploy();

  await certManager.waitForDeployment();
  const address = await certManager.getAddress();

  console.log(`CertificateManager deployed to: ${address}`);
  
  // Write address to a file for the frontend to consume
  const frontendConfig = {
    contractAddress: address,
    network: network.name,
    chainId: network.config.chainId,
  };
  fs.writeFileSync(
    "./src/config/contractAddress.json",
    JSON.stringify(frontendConfig, null, 2)
  );
  console.log("Contract address saved to src/config/contractAddress.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
