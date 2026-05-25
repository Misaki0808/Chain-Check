import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatAddress } from '../utils/formatAddress';
import { 
  getContract, 
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
      const contract = getContract(signer);
      
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
    <div className="wallet-connect-container">
      {!configValid && (
        <div className="alert alert-error">
          Contract deployment bilgisi bulunamadı. Lütfen local deploy scriptini çalıştırın.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      
      {contractStatus === 'Deploy Edilmedi' && (
        <div className="alert alert-error">
          Bu adreste deploy edilmiş contract bulunamadı. Lütfen local deploy scriptini tekrar çalıştırın.
        </div>
      )}

      {isWrongNetwork && (
        <div className="alert alert-warning">
          Lütfen MetaMask üzerinde Hardhat Local Network ağına geçin. Chain ID: 31337
        </div>
      )}

      {!account ? (
        <button 
          className="btn btn-primary" 
          onClick={connectWallet}
          disabled={isConnecting || !configValid}
        >
          {isConnecting ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="status-badge connected">Cüzdan Bağlandı</span>
          <div className="wallet-details">
            <p><strong>Kullanıcı Adresi:</strong> {formatAddress(account)}</p>
            <p><strong>Rol:</strong> {account.toLowerCase() === (INTERMEDIARY_ADDRESS || '').toLowerCase() ? 'Aracı Kurum' : 'Normal Kullanıcı'}</p>
            <p><strong>Ağ ID:</strong> {chainId}</p>
          </div>
          
          {/* Contract Connection Layer View */}
          {configValid && !isWrongNetwork && (
            <div className="contract-details" style={{ width: '100%', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Contract Durumu</h4>
              <p><strong>Contract Adresi:</strong> {formatAddress(CONTRACT_ADDRESS)}</p>
              <p><strong>Aracı Kurum:</strong> {formatAddress(INTERMEDIARY_ADDRESS)}</p>
              <p><strong>Bağlantı:</strong> <span className={contractStatus === 'Hazır (Bağlı)' ? 'text-success' : 'text-error'} style={{ fontWeight: 'bold' }}>{contractStatus}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
