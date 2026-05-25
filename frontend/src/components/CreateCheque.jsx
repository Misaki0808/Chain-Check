import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getSignerContract, isConfigValid } from '../utils/contractConnection';

const CreateCheque = ({ account, isDeployed }) => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [identityHash, setIdentityHash] = useState('');
  const [maskedName, setMaskedName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDetails, setTxDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isDeployed) {
      setError("Contract deploy edilmediği için işlem yapılamaz.");
      return;
    }

    if (!isConfigValid()) {
      setError("Contract adresi bulunamadı. Lütfen local deploy işlemini gerçekleştirin.");
      return;
    }

    try {
      setError('');
      setSuccess('');
      setTxDetails(null);
      
      // Basic validation
      if (!receiver || !amount || !dueDate || !identityHash || !maskedName) {
        setError('Tüm alanları doldurunuz.');
        return;
      }

      if (!ethers.isAddress(receiver)) {
        setError('Geçersiz alıcı cüzdan adresi.');
        return;
      }

      if (receiver.toLowerCase() === account.toLowerCase()) {
        setError('Kendinize çek oluşturamazsınız.');
        return;
      }

      setIsLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account);
      const contract = getSignerContract(signer);

      // Convert date to Unix timestamp (seconds)
      const dueDateUnix = Math.floor(new Date(dueDate).getTime() / 1000);
      
      const amountValue = BigInt(amount);

      const startTime = Date.now();

      const tx = await contract.createCheque(
        receiver,
        amountValue,
        dueDateUnix,
        identityHash,
        maskedName
      );

      const receipt = await tx.wait();
      
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      setSuccess('Çek başarıyla oluşturuldu.');
      setTxDetails({
        hash: receipt.hash,
        duration: durationSeconds
      });

      // Clear form
      setReceiver('');
      setAmount('');
      setDueDate('');
      setIdentityHash('');
      setMaskedName('');

    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Kullanıcı işlemi reddetti.');
      } else {
        setError('Çek oluşturulamadı. Lütfen bilgileri kontrol edin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return null; // Hide if not connected
  }

  const isFormDisabled = isLoading || !isConfigValid() || !isDeployed;

  return (
    <div className="create-cheque-container">
      <h3>Yeni Çek Oluştur</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      {txDetails && (
        <div className="tx-details">
          <p><strong>İşlem Hash:</strong> {txDetails.hash}</p>
          <p><strong>İşlem Süresi:</strong> {txDetails.duration} saniye</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-cheque-form">
        <div className="form-group">
          <label>İlk Alıcı Cüzdan Adresi (0x...)</label>
          <input 
            type="text" 
            value={receiver} 
            onChange={(e) => setReceiver(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>
        
        <div className="form-group">
          <label>Tutar (₺)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            disabled={isFormDisabled}
          />
        </div>

        <div className="form-group">
          <label>Vade Tarihi</label>
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isFormDisabled}
          />
        </div>

        <div className="form-group">
          <label>Kimlik Hash (Demo: Herhangi bir metin)</label>
          <input 
            type="text" 
            value={identityHash} 
            onChange={(e) => setIdentityHash(e.target.value)}
            placeholder="örn: 9f86d081884c7d659a2feaa0c55ad015..."
            disabled={isFormDisabled}
          />
        </div>

        <div className="form-group">
          <label>Maskeli Alıcı Adı (Demo)</label>
          <input 
            type="text" 
            value={maskedName} 
            onChange={(e) => setMaskedName(e.target.value)}
            placeholder="örn: Ahmet Y."
            disabled={isFormDisabled}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isFormDisabled}
        >
          {isLoading ? 'İşleniyor...' : 'Çek Oluştur'}
        </button>
      </form>
    </div>
  );
};

export default CreateCheque;
