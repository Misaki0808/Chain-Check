# QA & Demo Plan — ChainCheck Dijital Çek Projesi

## 1. Demo ve Test Ortamı

- **Blockchain:** Hardhat Local Network (`npx hardhat node`, `npx hardhat run scripts/deploy.js --network localhost`)
- **Frontend:** React + Vite (`npm run dev`)
- **Cüzdan:** MetaMask (Ağ: Hardhat Local, Chain ID: 31337)

**Hardhat Test/Demo Hesap Rolleri:**
- Account 0 = Aracı Kurum
- Account 1 = Çeki Oluşturan
- Account 2 = İlk Alıcı
- Account 3 = Yeni Alıcı
- Account 4 = İkinci Yeni Alıcı

---

## 2. Smart Contract Test Checklist (Otomatik)

Test dosyası: `/test/DigitalCheque.test.js` (`npx hardhat test`)
- [ ] Contract deploy ediliyor ve Aracı kurum adresi doğru atanıyor mu?
- [ ] Account 1 çek oluşturabiliyor mu? (Account 2'ye)
- [ ] Account 2 çeki kabul veya reddedebiliyor mu?
- [ ] Account 2 çeki Account 3'e devredebiliyor mu?
- [ ] Account 3 devri kabul veya reddedebiliyor mu?
- [ ] Mevcut sahip ödemeye gönderebiliyor mu?
- [ ] Account 0 (Aracı Kurum) ödemeyi kapatabiliyor mu?
- [ ] Yetkisiz kullanıcı işlemleri `revert` ediliyor mu?
- [ ] Final durumlardaki (`Rejected`, `Paid`, `Cancelled`) çeklerde yeni işlem engelleniyor mu?

---

## 3. UI Manuel Test & Demo Video Akışı (1-2 Dakika)

Bu senaryo hem manuel frontend testleri hem de makale/konferans video kaydı için kullanılacaktır.

### Hazırlık
Ekran temiz, zoom %100, terminal videoda yok. MetaMask Hardhat ağına bağlı ve yukarıdaki hesaplar import edilmiş.

### Akış
1. **Account 1 Bağlan:** Cüzdan bağlanır.
2. **Çek Oluşturma:** Tutar (₺50.000), Vade, İlk Alıcı (Account 2), Maskeli Ad (Ahmet Y.), Kimlik Hash girilir. → Durum: *Onay Bekliyor*. Hash ve süre ekranda görünür.
3. **Kabul (Account 2):** MetaMask'tan Account 2'ye geçilir. Çek "Kabul Et" butonuna basılır. → Durum: *Aktif*.
4. **Devir (Account 2 → Account 3):** Account 2 çeki Account 3 adresine devreder. → Durum: *Devir Bekliyor*.
5. **Devir Kabul (Account 3):** Account 3'e geçilir. "Devri Kabul Et" basılır. → Sahip: Account 3, Durum: *Aktif*.
6. **Ödeme Talebi (Account 3):** Ödemeye Gönder basılır. → Durum: *Ödemeye Gönderildi*.
7. **Ödeme Kapatma (Account 0):** Aracı Kurum hesabına geçilir, panelden "Ödendi Olarak İşaretle" yapılır. → Durum: *Ödendi*.
8. **İşlem Geçmişi:** Çek detayında tüm geçmiş (oluşturma → kabul → devir → kabul → ödeme talebi → ödendi) kronolojik gösterilir.

---

## 4. Olası Hatalar ve Çözümleri

- **MetaMask yanlış ağda:** Hardhat Local Network seç.
- **Contract çalışmıyor:** Adres ve ABI güncel mi? Hardhat node açık mı?
- **Yetkisiz işlem:** Doğru MetaMask hesabında mısın?
- **Çek görünmüyor:** Sayfayı yenile veya getUserCheques kontrol et.
- **Transaction pending kalıyor:** MetaMask aktivite geçmişini temizle, hesabı sıfırla (Reset Account).
