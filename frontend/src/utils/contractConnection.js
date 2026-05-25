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
    return code !== "0x";
  } catch (err) {
    console.error("Error checking contract code:", err);
    return false;
  }
};

/**
 * Returns a read-only contract instance connected to the provider.
 */
export const getReadOnlyContract = (provider) => {
  if (!isConfigValid()) {
    throw new Error("Contract is not deployed or config is missing.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, DigitalChequeABI, provider);
};

/**
 * Returns a writable contract instance connected to the given signer.
 */
export const getSignerContract = (signer) => {
  if (!isConfigValid()) {
    throw new Error("Contract is not deployed or config is missing.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, DigitalChequeABI, signer);
};

/**
 * Normalizes an ethers v6 Result object for a cheque into a clean JS object.
 */
export const normalizeCheque = (c) => {
  return {
    id: c.id ? c.id.toString() : '0',
    creator: c.creator,
    firstReceiver: c.firstReceiver,
    currentOwner: c.currentOwner,
    pendingReceiver: c.pendingReceiver,
    intermediary: c.intermediary,
    amount: c.amount ? c.amount.toString() : '0',
    dueDate: c.dueDate ? Number(c.dueDate) : 0,
    identityHash: c.identityHash,
    maskedName: c.maskedReceiverName, // from contract field maskedReceiverName
    status: c.status ? Number(c.status) : 0,
    createdAt: c.createdAt ? Number(c.createdAt) : 0,
    updatedAt: c.updatedAt ? Number(c.updatedAt) : 0
  };
};

export { CONTRACT_ADDRESS, INTERMEDIARY_ADDRESS, CHAIN_ID };
