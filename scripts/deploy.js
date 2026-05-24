/**
 * ChainCheck — Local Deployment Script (Sprint 1)
 *
 * Deploys DigitalCheque to Hardhat local network.
 * Account 0 is used as the intermediary (Aracı Kurum).
 *
 * Usage:
 *   1. Start local node:  npx hardhat node
 *   2. Deploy:            npx hardhat run scripts/deploy.js --network localhost
 */

import { network } from "hardhat";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Create network connection with viem ────────────────────────
const { viem } = await network.create();

const wallets = await viem.getWalletClients();
const intermediaryWallet = wallets[0]; // Account 0 = Aracı Kurum

const intermediaryAddress = intermediaryWallet.account.address;

console.log("═══════════════════════════════════════════════");
console.log("  ChainCheck — Local Deployment (Sprint 1)");
console.log("═══════════════════════════════════════════════\n");
console.log("Deploying DigitalCheque...");
console.log(`  Intermediary (Aracı Kurum): ${intermediaryAddress}\n`);

// ─── Deploy contract ────────────────────────────────────────────
const contract = await viem.deployContract("DigitalCheque", [intermediaryAddress], {
  client: { wallet: intermediaryWallet },
});

const contractAddress = contract.address;

console.log("✅ DigitalCheque deployed successfully!\n");
console.log(`  Contract Address : ${contractAddress}`);
console.log(`  Intermediary     : ${intermediaryAddress}`);
console.log(`  Network          : localhost`);
console.log(`  Chain ID         : 31337\n`);

// ─── Hardhat test account roles (for reference) ─────────────────
console.log("Hardhat Test Account Roles:");
console.log(`  Account 0 (Aracı Kurum)    : ${wallets[0].account.address}`);
console.log(`  Account 1 (Çeki Oluşturan) : ${wallets[1].account.address}`);
console.log(`  Account 2 (İlk Alıcı)      : ${wallets[2].account.address}`);
console.log(`  Account 3 (Yeni Alıcı)     : ${wallets[3].account.address}`);
console.log(`  Account 4 (2. Yeni Alıcı)  : ${wallets[4].account.address}\n`);

// ─── Save deployment.json ───────────────────────────────────────
const projectRoot = path.resolve(__dirname, "..");
const frontendConfigDir = path.join(projectRoot, "frontend", "src", "config");
const frontendAbiDir = path.join(projectRoot, "frontend", "src", "abi");

// Ensure directories exist
fs.mkdirSync(frontendConfigDir, { recursive: true });
fs.mkdirSync(frontendAbiDir, { recursive: true });

const deploymentInfo = {
  contractAddress: contractAddress,
  intermediary: intermediaryAddress,
  network: "localhost",
  chainId: 31337,
  deployedAt: new Date().toISOString(),
  accounts: {
    intermediary: wallets[0].account.address,
    creator: wallets[1].account.address,
    firstReceiver: wallets[2].account.address,
    newReceiver: wallets[3].account.address,
    secondNewReceiver: wallets[4].account.address,
  },
};

const deploymentPath = path.join(frontendConfigDir, "deployment.json");
fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2) + "\n");
console.log(`📄 Saved: frontend/src/config/deployment.json`);

// ─── Copy ABI to frontend ───────────────────────────────────────
const artifactPath = path.join(
  projectRoot,
  "artifacts",
  "contracts",
  "DigitalCheque.sol",
  "DigitalCheque.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const abiPath = path.join(frontendAbiDir, "DigitalCheque.json");
fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2) + "\n");
console.log(`📄 Saved: frontend/src/abi/DigitalCheque.json`);

console.log("\n═══════════════════════════════════════════════");
console.log("  Deployment complete! Frontend config updated.");
console.log("═══════════════════════════════════════════════\n");
