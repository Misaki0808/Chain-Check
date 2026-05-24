import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID } from '../config/contract';
import { formatAddress } from '../utils/formatAddress';

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Expected Chain ID from our local deployment
  const TARGET_CHAIN_ID = CHAIN_ID || 31337;

  useEffect(() => {
    // Check if MetaMask is already connected
    checkConnection();

    // Setup event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.error("Connection check failed", err);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setError('');
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (newChainId) => {
    // newChainId is a hex string (e.g. '0x7a69' for 31337)
    setChainId(Number(newChainId));
    // Reload page as recommended by MetaMask
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask bulunamadı. Lütfen MetaMask eklentisini yükleyin.');
      return;
    }

    try {
      setIsConnecting(true);
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Kullanıcı bağlantıyı reddetti.');
      } else {
        setError('Bağlantı sırasında bir hata oluştu: ' + err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const isWrongNetwork = chainId && chainId !== TARGET_CHAIN_ID;

  return (
    <div className="wallet-connect-container">
      {error && <div className="alert alert-error">{error}</div>}
      
      {isWrongNetwork && (
        <div className="alert alert-warning">
          Lütfen MetaMask üzerinde Hardhat Local Network ağına geçin. Beklenen Chain ID: {TARGET_CHAIN_ID} (Mevcut: {chainId})
        </div>
      )}

      {!account ? (
        <button 
          className="btn btn-primary" 
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="status-badge connected">Cüzdan Bağlandı</span>
          <div className="wallet-details">
            <p><strong>Adres:</strong> {formatAddress(account)}</p>
            <p><strong>Ağ ID:</strong> {chainId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
