> **Archived after documentation merge**

# Test Plan — ChainCheck Dijital Çek Projesi

## 1. Bu Dosyanın Amacı

Bu dosya ChainCheck projesinin Sprint 1 test planını tanımlar. Smart contract testleri, frontend manuel testleri ve demo öncesi kontrolleri kapsar.

---

## 2. Test Ortamı

```txt
Blockchain: Hardhat Local Network
Frontend: React + Vite
Wallet: MetaMask
Smart Contract: DigitalCheque.sol
```

Komutlar: `npx hardhat node` → `npx hardhat run scripts/deploy.js --network localhost` → `cd frontend && npm run dev`

Test hesapları ve roller için `docs/demo-script.md` §2'ye bakınız.

---

## 3. Smart Contract Testleri

Test dosyası: `/test/DigitalCheque.test.js` | Komut: `npx hardhat test`

### 3.1 Deploy Testi
- Contract deploy ediliyor mu?
- Aracı kurum adresi doğru atanıyor mu?

### 3.2 Çek Oluşturma
- Account 1 çek oluşturur → `ChequeCreated` event, `PendingApproval` status, `creator = Account 1`, `firstReceiver = Account 2`
- **Geçersiz:** İlk alıcı boş adres olamaz, oluşturanla aynı olamaz, tutar sıfır olamaz → revert

### 3.3 İlk Alıcı Kabul
- Account 2 kabul eder → `Active`, `currentOwner = Account 2`
- **Yetkisiz:** Account 3 başkasının çekini kabul edemez → revert

### 3.4 İlk Alıcı Red
- Account 2 reddeder → `Rejected`

### 3.5 Çek Devretme
- Account 2 aktif çeki Account 3'e devreder → `TransferPending`, `pendingReceiver = Account 3`
- **Yetkisiz:** currentOwner olmayan hesap devredemez → revert

### 3.6 Devir Kabul
- Account 3 kabul eder → `Active`, `currentOwner = Account 3`, `pendingReceiver = address(0)`

### 3.7 Devir Red
- Account 3 reddeder → `Active`, eski sahip kalır

### 3.8 Ödeme Talebi
- Mevcut sahip aktif çeki ödemeye gönderir → `PaymentRequested`
- **Yetkisiz:** currentOwner olmayan hesap ödeme talebi başlatamaz → revert

### 3.9 Aracı Kurum Ödeme Kapatma
- Account 0 ödemeyi kapatır → `Paid`
- **Yetkisiz:** Account 1/2/3 ödeme kapatamaz → revert

### 3.10 İptal Akışı
- Çek oluşturan kişiye geri devredilir → `Cancelled`

### 3.11 Final Durum Testleri

`Rejected`, `Paid`, `Cancelled` durumlarındaki çeklerde yeni işlem yapılamaz:
- Reddedilmiş çek devredilemez, kabul edilemez
- Ödenmiş çek devredilemez, tekrar ödemeye gönderilemez
- İptal edilmiş çek devredilemez

---

## 4. Frontend Manuel Testleri

### 4.1 Başlangıç Kontrolü
- [ ] Frontend localde açılıyor, konsolda kritik hata yok
- [ ] MetaMask bağlantı butonu görünüyor
- [ ] Contract address ve ABI güncel
- [ ] Hardhat local network seçili

### 4.2 MetaMask Testleri
- [ ] MetaMask yoksa uyarı çıkıyor
- [ ] Cüzdan bağlanıyor, adres ekranda gösteriliyor
- [ ] Hesap değiştirince frontend güncelleniyor
- [ ] Yanlış network seçilirse uyarı gösteriliyor

### 4.3 Çek Oluşturma UI
- [ ] Form alanları girilebiliyor (alıcı, tutar, vade, maskeli ad, kimlik hash)
- [ ] Boş form ve geçersiz adres gönderilemiyor
- [ ] MetaMask onayı açılıyor
- [ ] Başarı sonrası hash ve süre gösteriliyor
- [ ] Çek listede "Onay Bekliyor" durumunda görünüyor

### 4.4 Kabul / Red UI
- [ ] Account 2 ile çek görünüyor, Kabul Et / Reddet butonları var
- [ ] Kabul sonrası durum "Aktif", mevcut sahip Account 2
- [ ] Hash ve süre gösteriliyor

### 4.5 Devir UI
- [ ] Devret butonu görünüyor, yeni alıcı adresi girilebiliyor
- [ ] Devir sonrası "Devir Bekliyor", bekleyen yeni alıcı görünüyor
- [ ] Account 3 ile Devri Kabul Et / Devri Reddet butonları görünüyor
- [ ] Kabul sonrası sahip değişiyor

### 4.6 Ödeme UI
- [ ] Ödemeye Gönder butonu görünüyor
- [ ] İşlem sonrası "Ödemeye Gönderildi"

### 4.7 Aracı Kurum UI
- [ ] Account 0 ile aracı kurum panelinde ödemeye gönderilmiş çek görünüyor
- [ ] Ödendi Olarak İşaretle butonu çalışıyor
- [ ] İşlem sonrası "Ödendi"
- [ ] Yetkisiz kullanıcı işlem yapamıyor

### 4.8 İşlem Geçmişi
- [ ] Çek detayında tüm geçmiş adımlar sırasıyla görünüyor

### 4.9 Transaction Hash ve Süre
- [ ] Her başarılı işlemde hash gösteriliyor (`0x` ile başlıyor, boş değil)
- [ ] Süre saniye cinsinden gösteriliyor

---

## 5. Hata Ayıklama Yaklaşımı

Hata oluşursa kontrol sırası:
1. MetaMask doğru ağda mı?
2. Doğru hesap bağlı mı?
3. Hardhat node çalışıyor mu?
4. Contract deploy edildi mi?
5. Contract address ve ABI güncel mi?
6. Çek doğru durumda mı?
7. Kullanıcı yetkili mi?
8. Console error ne diyor?
9. Hardhat terminalinde revert sebebi var mı?

Büyük refactor yapılmadan önce hata izole edilmelidir.

### Yaygın Hatalar

| Hata | Çözüm |
|---|---|
| MetaMask yanlış ağda | Hardhat Local Network seç (31337, http://127.0.0.1:8545) |
| Contract çağrısı çalışmıyor | Address ve ABI kontrol et, Hardhat node yeniden başlat |
| Yetkisiz işlem | Doğru MetaMask hesabını bağla |
| Çek listede görünmüyor | getUserCheques kontrol, sayfa yenile |
| Transaction pending kalıyor | MetaMask aktivite geçmişi temizle, account reset |

---

## 6. Sprint 1 Tamamlandı Kriteri

- [ ] Smart contract testleri geçiyor
- [ ] Frontend localde çalışıyor
- [ ] MetaMask bağlantısı çalışıyor
- [ ] Temel çek akışı baştan sona tamamlanıyor
- [ ] Yetkisiz işlemler engelleniyor
- [ ] Final durumlar korunuyor
- [ ] İşlem hash ve süre gösteriliyor
- [ ] Çek geçmişi gösteriliyor
- [ ] Demo videosu çekilebilir durumda

---

## 7. Test Sonrası Rapor Formatı

```txt
Test edilen alan: ...
Sonuç: Başarılı / Başarısız
Değiştirilen dosyalar: ...
Çalıştırılan komutlar: ...
Kalan sorunlar: ...
Sonraki adım: ...
```