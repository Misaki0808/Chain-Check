import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatAddress } from '../utils/formatAddress';
import { 
  getSignerContract, 
  isConfigValid, 
  checkContractDeployed,
  CONTRACT_ADDRESS, 
  INTERMEDIARY_ADDRESS, 
  CHAIN_ID 
} from '../utils/contractConnection';

const WalletConnect = ({ onAccountChange, onDeployStatusChange }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractStatus, setContractStatus] = useState('Bağlanmadı');

  // Expected Chain ID from our local deployment
  const TARGET_CHAIN_ID = CHAIN_ID || 31337;
  const configValid = isConfigValid();

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

  const initContract = async (provider, userAddress) => {
    if (!configValid) {
      setContractStatus('Config Hatası');
      if (onDeployStatusChange) onDeployStatusChange(false);
      return;
    }

    try {
      const isDeployed = await checkContractDeployed(provider);
      if (!isDeployed) {
        setContractStatus('Deploy Edilmedi');
        if (onDeployStatusChange) onDeployStatusChange(false);
        return;
      }

      // We only instantiate the contract if the user is connected
      const signer = await provider.getSigner(userAddress);
      const contract = getSignerContract(signer);
      
      // If we reach here without throwing, we consider the contract connected
      if (contract.target) {
        setContractStatus('Hazır (Bağlı)');
        if (onDeployStatusChange) onDeployStatusChange(true);
      } else {
        setContractStatus('Hata');
        if (onDeployStatusChange) onDeployStatusChange(false);
      }
    } catch (err) {
      console.error("Contract init failed:", err);
      setContractStatus('Bağlantı Hatası');
      if (onDeployStatusChange) onDeployStatusChange(false);
    }
  };

  const updateAccountState = (userAddress) => {
    setAccount(userAddress);
    if (onAccountChange) {
      onAccountChange(userAddress);
    }
  };

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const userAddress = accounts[0].address;
          updateAccountState(userAddress);
          
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));

          // Only initialize contract if on correct network
          if (Number(network.chainId) === TARGET_CHAIN_ID) {
            await initContract(provider, userAddress);
          }
        }
      } catch (err) {
        console.error("Connection check failed", err);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      updateAccountState(null);
      setError('');
      setContractStatus('Bağlanmadı');
    } else {
      updateAccountState(accounts[0]);
      // Relying on page reload for full state reset is safer, but we can also re-check here
      window.location.reload(); 
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(Number(newChainId));
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
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const userAddress = accounts[0];
        updateAccountState(userAddress);
        
        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);
        setChainId(currentChainId);

        if (currentChainId === TARGET_CHAIN_ID) {
          await initContract(provider, userAddress);
        }
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
    <div className="wallet-connect-container" style={{ padding: 0, flexDirection: 'row', justifyContent: 'flex-end', gap: '1rem', width: '100%' }}>
      {!configValid && (
        <div className="status-badge status-rejected" title="Deploy scriptini çalıştırın">
          Config Hatası
        </div>
      )}

      {error && <div className="status-badge status-rejected" title={error}>Bağlantı Hatası</div>}
      
      {contractStatus === 'Deploy Edilmedi' && (
        <div className="status-badge status-rejected" title="Local deploy scriptini tekrar çalıştırın">
          Deploy Hatası
        </div>
      )}

      {isWrongNetwork && (
        <div className="status-badge status-pending" title="Ağ ID: 31337 olmalı">
          Yanlış Ağ
        </div>
      )}

      {!account ? (
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          onClick={connectWallet}
          disabled={isConnecting || !configValid}
        >
          {isConnecting ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-color)', padding: '0.35rem 0.5rem 0.35rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: configValid && !isWrongNetwork ? 'var(--success-color)' : 'var(--danger-color)' }}></span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
              {configValid && !isWrongNetwork ? 'Hazır' : 'Bağlı Değil'}
            </span>
          </div>
          <div className="monospace-small" style={{ background: 'var(--card-bg)', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
            {formatAddress(account)}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
