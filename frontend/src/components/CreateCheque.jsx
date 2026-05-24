import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../utils/contractConnection';

const CreateCheque = ({ account }) => {
  const [firstReceiver, setFirstReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [identityHash, setIdentityHash] = useState('0x8a3f5c9e1b7d2f4a6e0c3b8d5f7a1e9c4b6d2f91bc'); // Demo hash
  const [maskedName, setMaskedName] = useState('Ahmet Y.');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [txDetails, setTxDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTxDetails(null);

    // Basic Validation
    if (!ethers.isAddress(firstReceiver)) {
      setError('Geçersiz İlk Alıcı cüzdan adresi.');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Tutar 0\'dan büyük olmalıdır.');
      return;
    }
    if (!dueDate) {
      setError('Lütfen vade tarihi seçin.');
      return;
    }
    if (!maskedName.trim() || !identityHash.trim()) {
      setError('Lütfen maskeli ad ve kimlik hash alanlarını doldurun.');
      return;
    }
    if (firstReceiver.toLowerCase() === account.toLowerCase()) {
      setError('Çeki oluşturan, ilk alıcı olamaz.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMsg('MetaMask onayı bekleniyor...');

      if (!window.ethereum) throw new Error("MetaMask bulunamadı.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = getContract(signer);

      // Convert date to unix timestamp
      const dueTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);
      
      const startTime = Date.now();

      // Send transaction
      const tx = await contract.createCheque(
        firstReceiver,
        amount, // Stored as uint256 directly per requirements, no real money decimal parsing
        dueTimestamp,
        identityHash,
        maskedName
      );

      setLoadingMsg('Blockchain onayı bekleniyor... İşlem Hash: ' + tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      setSuccess('Çek başarıyla oluşturuldu.');
      setTxDetails({
        hash: receipt.hash,
        duration: durationSeconds,
        blockNumber: receipt.blockNumber
      });
      
      // Reset form
      setFirstReceiver('');
      setAmount('');
      setDueDate('');

    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Kullanıcı işlemi reddetti.');
      } else {
        // Keep user-facing error short, no raw blockchain error dump
        setError('Çek oluşturulamadı. Lütfen bilgileri kontrol edin.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  const configValid = isConfigValid();

  return (
    <div className="create-cheque-container">
      <h3>Yeni Dijital Çek Oluştur</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {txDetails && (
        <div className="tx-details">
          <p><strong>İşlem Hash:</strong> {txDetails.hash}</p>
          <p><strong>İşlem Süresi:</strong> {txDetails.duration} saniye</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="cheque-form">
        <div className="form-group">
          <label>İlk Alıcı Wallet Adresi</label>
          <input 
            type="text" 
            value={firstReceiver} 
            onChange={(e) => setFirstReceiver(e.target.value)} 
            placeholder="0x..." 
            disabled={isLoading || !configValid}
          />
        </div>
        
        <div className="form-group">
          <label>Tutar</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Örn: 50000" 
            min="1"
            disabled={isLoading || !configValid}
          />
        </div>

        <div className="form-group">
          <label>Vade Tarihi</label>
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            disabled={isLoading || !configValid}
          />
        </div>

        <div className="form-group">
          <label>Maskeli Alıcı Adı</label>
          <input 
            type="text" 
            value={maskedName} 
            onChange={(e) => setMaskedName(e.target.value)} 
            disabled={isLoading || !configValid}
          />
          <small className="form-hint">Demo amaçlıdır. Gerçek isim kullanmayın.</small>
        </div>

        <div className="form-group">
          <label>Kimlik Hash</label>
          <input 
            type="text" 
            value={identityHash} 
            onChange={(e) => setIdentityHash(e.target.value)} 
            disabled={isLoading || !configValid}
          />
          <small className="form-hint">Demo TC/VKN hash temsili.</small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary submit-btn" 
          disabled={isLoading || !account || !configValid}
        >
          {isLoading ? 'İşleniyor...' : 'Çek Oluştur'}
        </button>

        {isLoading && <div className="loading-msg">{loadingMsg}</div>}
      </form>
    </div>
  );
};

export default CreateCheque;
