/**
 * ChainCheck — Aktif Cüzdan Oturumu (gerçek MetaMask ↔ otomatik tanıtım)
 *
 * Bütün bileşenler provider/signer'ı doğrudan window.ethereum'dan kurmak yerine
 * buradan alır. Normal modda MetaMask kullanılır. "Otomatik Tanıtım" modunda ise
 * doğrudan Hardhat local node'a bağlanılır ve işlemler bilinen test
 * anahtarlarıyla imzalanır (MetaMask popup'ı olmadan).
 */
import { ethers } from 'ethers';
import { RPC_URL } from './demoAccounts';

let demoActive = false;
let demoAddress = null;
let demoPrivateKey = null;

export function enterDemo(address, privateKey) {
  demoActive = true;
  demoAddress = address;
  demoPrivateKey = privateKey;
}

export function setDemoActor(address, privateKey) {
  demoAddress = address;
  demoPrivateKey = privateKey;
}

export function exitDemo() {
  demoActive = false;
  demoAddress = null;
  demoPrivateKey = null;
}

export function isDemoActive() {
  return demoActive;
}

export function getDemoAddress() {
  return demoAddress;
}

/** Okuma için uygun provider'ı döndürür. */
export function getActiveProvider() {
  if (demoActive) {
    return new ethers.JsonRpcProvider(RPC_URL);
  }
  if (!window.ethereum) throw new Error('MetaMask bulunamadı.');
  return new ethers.BrowserProvider(window.ethereum);
}

/** Yazma (imzalama) için uygun signer'ı döndürür. */
export async function getActiveSigner(account) {
  if (demoActive) {
    return new ethers.Wallet(demoPrivateKey, new ethers.JsonRpcProvider(RPC_URL));
  }
  if (!window.ethereum) throw new Error('MetaMask bulunamadı.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner(account);
}
