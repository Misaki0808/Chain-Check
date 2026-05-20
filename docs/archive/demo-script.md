> **Archived after documentation merge**

# Demo Script — ChainCheck Dijital Çek Projesi

## 1. Bu Dosyanın Amacı

Bu dosya, ChainCheck projesinin demo videosu için izlenecek akışı tanımlar. Amaç, uygulamanın 1–2 dakikalık video içinde anlaşılır ve sorunsuz gösterilmesidir.

---

## 2. Demo Ortamı

```txt
Frontend: React + Vite (localhost)
Blockchain: Hardhat Local Network
Wallet: MetaMask
Smart Contract: DigitalCheque.sol
Backend/Database: Yok
```

## Demo Hesap Rolleri

```txt
Account 0 = Aracı Kurum
Account 1 = Çeki Oluşturan
Account 2 = İlk Alıcı
Account 3 = Yeni Alıcı
Account 4 = İkinci Yeni Alıcı
```

---

## 3. Demo Öncesi Hazırlık

- [ ] Hardhat local network çalışıyor (`npx hardhat node`)
- [ ] Smart contract deploy edildi (`npx hardhat run scripts/deploy.js --network localhost`)
- [ ] Frontend çalışıyor (`cd frontend && npm run dev`)
- [ ] MetaMask Hardhat local network'e bağlı (Chain ID: 31337)
- [ ] Demo hesapları MetaMask'a eklenmiş
- [ ] Contract address ve ABI frontend config'de güncel
- [ ] Tarayıcı ekranı temiz, gereksiz sekmeler kapatılmış
- [ ] UI yazıları okunabilir büyüklükte

---

## 4. Demo Akışı

### Adım 1 — Cüzdan Bağlama (Account 1 = Çeki Oluşturan)

Ekranda: `Cüzdan bağlandı — Adres: 0x...`

### Adım 2 — Çek Oluşturma

```txt
İlk Alıcı: Account 2
Tutar: ₺50.000
Vade: 30 gün sonrası
Maskeli Ad: Ahmet Y.
Kimlik Hash: 0xDEMO_HASH_001
```

MetaMask onayı → Ekranda: `Çek oluşturuldu — Durum: Onay Bekliyor — Hash: 0x... — Süre: X sn`

### Adım 3 — İlk Alıcı Kabul (Account 2)

MetaMask hesap değiştir → Kabul Et → Ekranda: `Çek kabul edildi — Durum: Aktif — Sahip: Account 2`

### Adım 4 — Çeki Devretme (Account 2 → Account 3)

Devret → Yeni alıcı adresi gir → Ekranda: `Devir talebi oluşturuldu — Durum: Devir Bekliyor`

### Adım 5 — Yeni Alıcı Devir Kabul (Account 3)

MetaMask hesap değiştir → Devri Kabul Et → Ekranda: `Devir kabul edildi — Sahip: Account 3`

### Adım 6 — Ödemeye Gönderme (Account 3)

Ödemeye Gönder → Ekranda: `Ödeme talebi başlatıldı — Durum: Ödemeye Gönderildi`

### Adım 7 — Aracı Kurum Ödeme Kapatma (Account 0)

MetaMask hesap değiştir → Aracı kurum paneli → Ödendi Olarak İşaretle → Ekranda: `Çek ödendi — Durum: Ödendi`

### Adım 8 — İşlem Geçmişi

Çek detayında tüm geçmiş adımlar gösterilir:
```txt
Çek oluşturuldu → İlk alıcı kabul etti → Devir talebi → Yeni alıcı kabul etti → Ödeme talebi → Ödendi
```

---

## 5. Çok Kısa Sunum Versiyonu (60–90 saniye)

```txt
1. Çek oluştur → 2. İlk alıcı kabul → 3. Devret → 4. Yeni alıcı kabul → 5. Ödemeye gönder → 6. Ödendi yap → 7. Geçmişi göster
```

---

## 6. Videoda Gösterilecekler

- Cüzdan bağlantısı
- Çek oluşturma ekranı ve durumu
- Mevcut sahip ve devir geçmişi
- İşlem hash'i ve süresi
- Çek geçmişi timeline'ı

## Videoda Gösterilmeyecekler

- Private key / seed phrase
- Gerçek TC/VKN veya kişi adı
- Gereksiz terminal karmaşası
- Hata ekranları veya uzun bekleme süreleri

---

## 7. İşlem Süresi Ölçümü

Her işlemde süre ölçülür. Örnek:

```txt
Çek oluşturma: 4.2 sn | Kabul: 3.8 sn | Devir talebi: 4.5 sn | Devir kabul: 4.0 sn | Ödeme talebi: 3.9 sn | Ödeme kapatma: 4.1 sn
```

Bu süreler demo ortamı gözlemidir. Gerçek banka ödeme süresi olarak sunulmamalıdır.

---

## 8. Makale İçin Güvenli İfade

Doğru:
> Bu prototip, geleneksel çek süreçlerinde manuel ve fiziksel adımların dijitalleştirilmesi durumunda işlem başlatma ve doğrulama süreçlerinin önemli ölçüde hızlanabileceğini göstermektedir.

Yanlış:
> Bu sistem gerçek çek tahsilatını her zaman 5 saniyede yapar.

---

## 9. Demo Video Anlatım Metni

```txt
Bu demoda ChainCheck adlı blockchain tabanlı dijital çek prototipinin temel akışı gösterilmektedir.
Kullanıcı dijital bir çek oluşturur. İlk alıcı çeki kabul eder.
Mevcut sahip çeki başka bir kullanıcıya devreder. Yeni alıcı devri kabul eder.
Çek ödemeye gönderilir. Aracı kurum çeki ödendi olarak işaretler.
Tüm işlemler blockchain üzerinde kayıt altına alınır ve işlem geçmişi görüntülenebilir.
```

---

## 10. Demo Sırasında Olası Hatalar

| Hata | Çözüm |
|---|---|
| MetaMask yanlış ağda | Hardhat Local Network seç (Chain ID: 31337) |
| Contract address hatalı | Deploy sonrası frontend config'i güncelle |
| ABI eski | Contract yeniden compile et, ABI dosyasını güncelle |
| Yetkisiz işlem | Doğru MetaMask hesabına geç |
| Çek listede görünmüyor | Sayfa yenile, doğru hesap kontrolü, getUserCheques kontrol et |

---

## 11. Demo Başarı Checklist

- [ ] Çek oluşturulabiliyor
- [ ] İlk alıcı kabul edebiliyor
- [ ] Çek devredilebiliyor ve yeni alıcı kabul edebiliyor
- [ ] Çek ödemeye gönderilebiliyor
- [ ] Aracı kurum ödendi yapabiliyor
- [ ] İşlem hash'i ve süresi gösteriliyor
- [ ] Çek geçmişi gösteriliyor
- [ ] Video akışı 1–2 dakika içinde gösterilebiliyor

---

## 12. Video Çekim Tavsiyeleri

- Tarayıcı zoom %100 veya %110
- Terminal videoya dahil edilmez
- MetaMask işlemleri hızlı ve net
- Her işlemden sonra durum değişimi gösterilir
- İşlem geçmişi finalde mutlaka gösterilir
- Gereksiz bekleme ve tekrarlarla uzatılmaz