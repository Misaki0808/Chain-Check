/**
 * ChainCheck — Aktif Cüzdan Oturumu
 *
 * Bütün bileşenler provider/signer'ı doğrudan window.ethereum'dan kurmak
 * yerine buradan alır.
 */
import { ethers } from 'ethers';

/** Okuma için uygun provider'ı döndürür. */
export function getActiveProvider() {
  if (!window.ethereum) throw new Error('MetaMask bulunamadı.');
  return new ethers.BrowserProvider(window.ethereum);
}

/** Yazma (imzalama) için uygun signer'ı döndürür. */
export async function getActiveSigner(account) {
  if (!window.ethereum) throw new Error('MetaMask bulunamadı.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner(account);
}
