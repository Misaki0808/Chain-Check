import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, INTERMEDIARY_ADDRESS, CHAIN_ID } from '../config/contract';
import DigitalChequeABI from '../abi/DigitalCheque.json';

/**
 * Helper to check if deployment config exists
 */
export const isConfigValid = () => {
  return CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
};

/**
 * Checks if the contract is actually deployed on the current network.
 * @param {ethers.Provider} provider 
 * @returns {Promise<boolean>}
 */
export const checkContractDeployed = async (provider) => {
  if (!isConfigValid()) return false;
  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    // If it's just "0x", it means no bytecode is at this address
    return code !== "0x";
  } catch (err) {
    console.error("Error checking contract code:", err);
    return false;
  }
};

/**
 * Returns a contract instance connected to the given provider or signer.
 * @param {ethers.Provider | ethers.Signer} providerOrSigner 
 * @returns {ethers.Contract} The connected DigitalCheque contract
 */
export const getContract = (providerOrSigner) => {
  if (!isConfigValid()) {
    throw new Error("Contract is not deployed or config is missing.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, DigitalChequeABI, providerOrSigner);
};

export { CONTRACT_ADDRESS, INTERMEDIARY_ADDRESS, CHAIN_ID };
