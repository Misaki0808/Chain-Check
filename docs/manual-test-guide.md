# ChainCheck Manual Test Guide and Checklist

Bu doküman, ChainCheck Sprint 1 demosunu test edecek kişi için hazırlanmıştır.

Bu testi yapacak kişinin blockchain, Hardhat veya MetaMask hakkında ileri seviye bilgi sahibi olması gerekmez. Amaç, uygulamanın baştan sona çalışıp çalışmadığını adım adım kontrol etmektir.

---

# 1. Testin Amacı

Bu testin amacı, ChainCheck uygulamasının demo akışının düzgün çalışıp çalışmadığını kontrol etmektir.

ChainCheck, dijital çek süreçlerini blockchain üzerinde simüle eden bir demo uygulamasıdır.

Bu demo şunları test eder:

- Cüzdan bağlama
- Local blockchain ağına bağlanma
- Contract bağlantısı
- Çek oluşturma
- Çek listeleme
- Çek detayını görüntüleme
- Çeki oluşturan kişinin özetini görüntüleme
- Çek kabul etme / reddetme
- Çek devretme
- Devir kabul etme / reddetme
- Ödemeye gönderme
- Aracı kurum tarafından “Ödendi” yapma
- İşlem geçmişini görüntüleme

---

# 2. Önemli Güvenlik Notu

Bu proje gerçek para, gerçek banka, gerçek TC/VKN veya gerçek finansal veri kullanmaz.

Test sırasında:

- Gerçek MetaMask hesabınızı kullanmayın.
- Gerçek private key kullanmayın.
- Gerçek seed phrase kullanmayın.
- Gerçek para göndermeyin.
- Hardhat tarafından verilen test hesaplarını kullanın.

Hardhat hesapları sadece local demo içindir. Gerçek ağlarda kullanılmamalıdır.

---

# 3. Testte Kullanılacak Roller

Testte 4 farklı hesap kullanılacak.

| Hesap | Rol | Ne yapacak? |
|---|---|---|
| Account #0 | Aracı Kurum | En sonda çeki “Ödendi” yapacak |
| Account #1 | Çeki Oluşturan | İlk çeki oluşturacak |
| Account #2 | İlk Alıcı | Çeki kabul edecek ve sonra devredecek |
| Account #3 | Yeni Alıcı | Devri kabul edecek ve ödemeye gönderecek |

Basit akış:

```txt
Account #1 → Çek oluşturur
Account #2 → Çeki kabul eder
Account #2 → Çeki Account #3’e devreder
Account #3 → Devri kabul eder
Account #3 → Çeki ödemeye gönderir
Account #0 → Aracı kurum olarak “Ödendi” yapar
```

---

# 4. Teste Başlamadan Önce Gerekenler

Test için şunlar gerekir:

- VS Code veya terminal
- Google Chrome veya benzeri tarayıcı
- MetaMask eklentisi
- ChainCheck proje klasörü
- Hardhat Local Network
- Test hesapları

---

# 5. Projeyi Çalıştırma Komutları

Aşağıdaki komutları doğru klasörlerde çalıştırmak önemlidir.

---

## Terminal 1 — Local Blockchain Başlatma

Proje ana klasöründe çalıştır:

```bash
npx hardhat node
```

Bu terminal açık kalmalıdır.

Bu komut çalışınca ekranda test hesapları görünür:

```txt
Account #0
Address: 0x...
Private Key: 0x...

Account #1
Address: 0x...
Private Key: 0x...
```

Bu hesaplar demo içindir.

---

## Terminal 2 — Contract Deploy Etme

Yeni terminal aç.

Proje ana klasöründe çalıştır:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Bu komut contract’ı local blockchain ağına deploy eder.

Başarılı olursa terminalde contract adresi görünür.

---

## Terminal 3 — Frontend Başlatma

Yeni terminal aç.

Proje ana klasöründeysen:

```bash
cd frontend
npm run dev
```

Uygulama genelde şu adreste açılır:

```txt
http://localhost:5173
```

---

# 6. MetaMask Local Ağ Kurulumu

MetaMask içinde yeni ağ ekle:

| Alan | Değer |
|---|---|
| Network Name | Hardhat Local |
| RPC URL | http://127.0.0.1:8545 |
| Chain ID | 31337 |
| Currency Symbol | ETH |
| Block Explorer | Boş bırak |

Ağı ekledikten sonra MetaMask’ta **Hardhat Local** ağına geç.

---

# 7. MetaMask Test Hesaplarını Ekleme

Terminal 1’de `npx hardhat node` çalışınca Account #0, #1, #2, #3 için private key değerleri görünür.

MetaMask’ta:

```txt
Hesap ekle / Import Account
Private Key
```

ile şu hesapları ekle:

- Account #0
- Account #1
- Account #2
- Account #3

Dikkat:

- Address uygulama formuna yazılır.
- Private key sadece MetaMask’a hesap eklemek için kullanılır.
- Private key uygulama içine yazılmaz.

---

# 8. Ana Demo Test Akışı

Bu bölümde uygulamanın baştan sona çalışıp çalışmadığı test edilir.

---

## Step 1 — Account #1 ile Çek Oluştur

> **Önemli Not:**
> 1. Sayfaya ilk girdiğinizde **"Cüzdanı Bağla"** (Connect Wallet) butonuna basarak MetaMask'ı uygulamaya bağlayın.
> 2. Formlardaki 'Adres' kısımlarına yazacağınız değerleri, Terminal 1'de çalıştırdığınız Hardhat ekranındaki 'Address: 0x...' satırlarından kopyalayabilirsiniz.

MetaMask’ta **Account #1** seç. *(Tarayıcınızın sağ üstündeki MetaMask ikonuna tıklayıp, hesap listesinden Account #1'i seçin)*

Uygulamada “Yeni Çek Oluştur” formunu doldur.

| Alan | Değer |
|---|---|
| İlk Alıcı Cüzdan Adresi | Account #2 address |
| Tutar | 50000 |
| Vade Tarihi | Gelecekte bir tarih |
| Kimlik Hash | 0xDEMO_HASH_AHMET_Y_001 |
| Maskeli Alıcı Adı | Ahmet Y. |

Sonra:

```txt
Çek Oluştur
```

butonuna bas.

MetaMask açıldığında **Onayla (Confirm)** butonuna basarak işlemi onayla. *(Görünen işlem ücretleri tamamen test ağındaki sahte paralardır, endişe etmeyin.)*

Beklenen sonuç:

- “Çek başarıyla oluşturuldu.” mesajı görünür.
- İşlem hash’i görünür.
- İşlem süresi görünür.
- Çeklerim bölümünde yeni çek görünür.
- Durum: “Onay Bekliyor” olur.
- İşlem geçmişinde “Çek oluşturuldu” görünür.

---

## Step 2 — Account #2 ile Çeki Kabul Et

MetaMask’ta **Account #2** seç. *(MetaMask uzantısını açıp, hesap listesinden Account 2'ye geçiş yapın)*

Sayfada gerekirse “Yenile” butonuna bas.

Beklenen:

- Çeklerim bölümünde çek görünür.
- Çek detayını açınca “Kabul Et” ve “Reddet” butonları görünür.
- “Çeki Oluşturan Özeti” görünür.

Sonra:

```txt
Kabul Et
```

butonuna bas.

MetaMask işlemini onayla.

Beklenen sonuç:

- Durum: “Aktif” olur.
- Mevcut Sahip: Account #2 olur.
- İşlem hash’i görünür.
- İşlem süresi görünür.
- İşlem geçmişinde “Çek kabul edildi” görünür.

---

## Step 3 — Account #2 ile Çeki Devret

MetaMask hâlâ **Account #2** üzerinde olsun.

Çek detayında “Devret” bölümü görünmelidir.

Yeni alıcı adresi olarak **Account #3 address** yaz.

Sonra:

```txt
Devret
```

butonuna bas.

MetaMask işlemini onayla.

Beklenen sonuç:

- Durum: “Devir Bekliyor” olur.
- Bekleyen Yeni Alıcı: Account #3 olur.
- İşlem geçmişinde “Devir talebi oluşturuldu” görünür.

---

## Step 4 — Account #3 ile Devri Kabul Et

MetaMask’ta **Account #3** seç.

Sayfada gerekirse “Yenile” butonuna bas.

Beklenen:

- Çeklerim bölümünde çek görünür.
- Çek detayında “Devri Kabul Et” ve “Devri Reddet” butonları görünür.

Sonra:

```txt
Devri Kabul Et
```

butonuna bas.

MetaMask işlemini onayla.

Beklenen sonuç:

- Durum: “Aktif” olur.
- Mevcut Sahip: Account #3 olur.
- İşlem geçmişinde “Devir kabul edildi” görünür.

---

## Step 5 — Account #3 ile Ödemeye Gönder

MetaMask hâlâ **Account #3** üzerinde olsun.

Çek detayında:

```txt
Ödemeye Gönder
```

butonu görünmelidir.

Butona bas ve MetaMask işlemini onayla.

Beklenen sonuç:

- Durum: “Ödemeye Gönderildi” olur.
- İşlem geçmişinde “Ödeme talebi başlatıldı” görünür.

---

## Step 6 — Account #0 ile Ödendi Yap

MetaMask’ta **Account #0** seç.

Bu hesap “Aracı Kurum” rolündedir.

Beklenen:

- “Aracı Kurum Paneli” görünür.
- Ödemeye gönderilen çek bu panelde görünür.

Çeki aç.

Sonra:

```txt
Ödendi Olarak İşaretle
```

butonuna bas.

MetaMask işlemini onayla.

Beklenen sonuç:

- Durum: “Ödendi” olur.
- İşlem geçmişinde “Çek ödendi olarak işaretlendi” görünür.
- Çek, bekleyen ödeme listesinden kaybolabilir. Bu normaldir.

---

# 9. Çeki Oluşturan Özeti Testi

Çek detay ekranında “Çeki Oluşturan Özeti” kartı görünmelidir.

Bu kart, çeki oluşturan hesabın blockchain üzerindeki demo çek geçmişini gösterir.

Kontrol edilecek alanlar:

- Toplam Oluşturulan Çek
- Ödenen Çek
- Devam Eden Çek
- Reddedilen Çek
- İptal Edilen Çek
- Ödeme Başarı Oranı

Bu kart gerçek kredi skoru değildir.

Ekranda şu uyarı bulunmalıdır:

```txt
Bu özet, çeki oluşturan adresin blockchain üzerindeki demo çek geçmişinden hesaplanır. Gerçek finansal skor değildir.
```

---

# 10. İşlem Geçmişi Testi

Finalde işlem geçmişinde şu kayıtlar görünmelidir:

```txt
Çek oluşturuldu
Çek kabul edildi
Devir talebi oluşturuldu
Devir kabul edildi
Ödeme talebi başlatıldı
Çek ödendi olarak işaretlendi
```

Her işlem kaydında şunlar olmalıdır:

- İşlem adı
- İşlemi yapan cüzdan adresi
- Tarih / saat

---

# 11. Negatif Testler

Bu bölümde hatalı kullanım senaryoları test edilir.

## Yanlış Ağ Testi

MetaMask’ta başka bir ağa geç.

Beklenen:

```txt
Lütfen MetaMask üzerinde Hardhat Local Network ağına geçin. Chain ID: 31337
```

uyarısı görünmelidir.

---

## Contract Deploy Edilmemiş Testi

Hardhat node açık ama deploy script çalışmamışsa uygulama şu uyarıyı vermelidir:

```txt
Bu adreste deploy edilmiş contract bulunamadı. Lütfen local deploy scriptini tekrar çalıştırın.
```

---

## Boş Form Testi

Çek oluşturma formunda alanları boş bırakıp “Çek Oluştur” butonuna bas.

Beklenen:

```txt
Tüm alanları doldurunuz.
```

veya benzeri bir uyarı çıkmalıdır.

---

## Hatalı Cüzdan Adresi Testi

İlk alıcı adresine geçersiz bir değer yaz:

```txt
abc123
```

Beklenen:

- Sistem işlemi başlatmamalıdır.
- Kullanıcıya hata mesajı göstermelidir.

---

## Yetkisiz Kabul Testi

Account #1 ile, yani çeki oluşturan hesapla çeki kabul etmeye çalış.

Beklenen:

- Kabul Et butonu görünmemelidir.

---

## Yetkisiz Devir Testi

Çekin mevcut sahibi olmayan bir hesapla devretmeye çalış.

Beklenen:

- Devret bölümü görünmemelidir.

---

## Yetkisiz Ödeme Testi

Account #0 dışındaki hesapla “Ödendi Olarak İşaretle” yapmaya çalış.

Beklenen:

- Bu buton görünmemelidir.

---

# 12. Manual Test Checklist

Aşağıdaki maddeleri test sırasında tikleyin.

---

## Environment Setup

- [x] Proje klasörü açıldı.
- [x] Terminal 1’de `npx hardhat node` çalıştı.
- [x] Terminal 1 açık bırakıldı.
- [x] Terminal 2’de deploy script çalıştı.
- [x] Contract başarıyla deploy edildi.
- [x] Terminal 3’te frontend çalıştı.
- [x] Uygulama tarayıcıda açıldı.
- [x] MetaMask yüklü.
- [x] Hardhat Local ağı eklendi.
- [x] MetaMask Hardhat Local ağına geçti.
- [x] Account #0 import edildi.
- [x] Account #1 import edildi.
- [x] Account #2 import edildi.
- [x] Account #3 import edildi.

---

## Wallet and Contract

- [x] Cüzdan başarıyla bağlandı.
- [x] Kullanıcı adresi görünüyor.(hepsi değil kısaltılmış hali)
- [x] Rol bilgisi görünüyor.
- [x] Ağ ID 31337 görünüyor.
- [x] Contract adresi görünüyor.(hepsi değil kısaltılmış hali)
- [x] Aracı kurum adresi görünüyor.(hepsi değil kısaltılmış hali)
- [x] Bağlantı durumu “Hazır” görünüyor.
- [x] Yanlış ağ uyarısı çalışıyor.
- [x] Contract deploy edilmemiş uyarısı çalışıyor.
- [x] Dashboard ve Çeklerim bölümü çelişkili durum göstermiyor.

---

## Cheque Creation

- [x] Account #1 ile giriş yapıldı.
- [x] Account #2 adresi ilk alıcı olarak yazıldı.
- [x] Tutar alanı dolduruldu.
- [x] Vade tarihi seçildi.
- [x] Kimlik Hash alanı dolduruldu.
- [x] Maskeli Alıcı Adı dolduruldu.
- [x] Çek Oluştur butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Başarı mesajı göründü.
- [x] İşlem hash’i göründü.
- [x] İşlem süresi göründü.
- [x] Çeklerim bölümünde çek göründü.
- [x] Durum “Onay Bekliyor” oldu.

---

## Listing and Detail

- [x] Çek listesi hata vermeden yüklendi.
- [x] Yenile butonu çalışıyor.
- [x] Çek kartı görünüyor.
- [x] Çek ID görünüyor.
- [x] Tutar doğru görünüyor.
- [x] Vade tarihi doğru görünüyor.
- [x] Durum etiketi doğru görünüyor.
- [x] Çek detayı açılıyor.
- [x] Çeki oluşturan adres görünüyor.(hepsi değil kısaltılmış hali)
- [x] İlk alıcı adresi görünüyor.(hepsi değil kısaltılmış hali)
- [x] Mevcut sahip adresi görünüyor.(hepsi değil kısaltılmış hali)
- [x] Bekleyen yeni alıcı alanı gerektiğinde görünüyor.
- [x] Kimlik Hash görünüyor.(hepsi değil kısaltılmış hali)
- [x] Maskeli alıcı adı görünüyor.
- [x] Uzun adresler arayüzü bozmuyor.
- [x] Uzun hash arayüzü bozmuyor.

---

## Issuer Summary

- [x] Çeki Oluşturan Özeti kartı görünüyor.
- [x] Toplam Oluşturulan Çek sayısı görünüyor.
- [x] Ödenen Çek sayısı görünüyor.
- [x] Devam Eden Çek sayısı görünüyor.
- [x] Reddedilen Çek sayısı görünüyor.
- [x] İptal Edilen Çek sayısı görünüyor.
- [x] Ödeme Başarı Oranı görünüyor.
- [x] “Gerçek finansal skor değildir” uyarısı görünüyor.
- [x] Özet kartı arayüzü bozmuyor.

---

## Accept / Reject

- [x] Account #2’ye geçildi.
- [x] Account #2 çeki görebiliyor.
- [x] Çek detayı açılıyor.
- [x] Kabul Et butonu görünüyor.
- [x] Reddet butonu görünüyor.
- [x] Account #1 kabul/red butonlarını görmüyor.
- [x] Kabul Et butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Durum “Aktif” oldu.
- [x] Mevcut sahip Account #2 oldu.
- [x] İşlem hash’i göründü.
- [x] İşlem süresi göründü.
- [x] İşlem geçmişinde “Çek kabul edildi” göründü.

---

## Transfer

- [x] Account #2 mevcut sahip olarak çeki görüyor.
- [x] Devret bölümü görünüyor.
- [x] Account #3 adresi yeni alıcı olarak yazıldı.
- [x] Devret butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Durum “Devir Bekliyor” oldu.
- [x] Bekleyen yeni alıcı Account #3 oldu.
- [x] İşlem geçmişinde “Devir talebi oluşturuldu” göründü.
- [x] Account #3’e geçildi.
- [x] Account #3 çeki görebiliyor.
- [x] Devri Kabul Et butonu görünüyor.
- [x] Devri Reddet butonu görünüyor.
- [x] Devri Kabul Et butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Durum “Aktif” oldu.
- [x] Mevcut sahip Account #3 oldu.
- [x] İşlem geçmişinde “Devir kabul edildi” göründü.

---

## Payment

- [x] Account #3 mevcut sahip olarak çeki görüyor.
- [x] Ödemeye Gönder butonu görünüyor.
- [x] Ödemeye Gönder butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Durum “Ödemeye Gönderildi” oldu.
- [x] İşlem geçmişinde “Ödeme talebi başlatıldı” göründü.
- [x] Account #0’a geçildi.
- [x] Aracı Kurum Paneli görünüyor.
- [x] Ödemeye gönderilen çek panelde görünüyor.
- [x] Ödendi Olarak İşaretle butonu görünüyor.
- [x] Ödendi Olarak İşaretle butonuna basıldı.
- [x] MetaMask onayı geldi.
- [x] İşlem onaylandı.
- [x] Durum “Ödendi” oldu.
- [x] İşlem geçmişinde “Çek ödendi olarak işaretlendi” göründü.
- [x] Çek bekleyen ödeme panelinden kayboldu veya listede ödendi olarak göründü.

---

## History Timeline

- [x] İşlem Geçmişi bölümü görünüyor.
- [x] “Çek oluşturuldu” görünüyor.
- [x] “Çek kabul edildi” görünüyor.
- [x] “Devir talebi oluşturuldu” görünüyor.
- [x] “Devir kabul edildi” görünüyor.
- [x] “Ödeme talebi başlatıldı” görünüyor.
- [x] “Çek ödendi olarak işaretlendi” görünüyor.
- [x] İşlemi yapan cüzdan adresleri görünüyor.(hepsi değil kısaltılmış hali)
- [x] Tarih/saat bilgileri okunuyor.
- [x] Timeline arayüzü bozulmuyor.

---

## Negative / Edge Cases

- [x] Yanlış ağda uyarı çıkıyor.
- [x] Cüzdan bağlı değilken işlem yapılamıyor.
- [x] Contract deploy edilmemişken işlem yapılamıyor.
- [x] Boş form gönderilemiyor.
- [x] Geçersiz alıcı adresi kabul edilmiyor.
- [x] Sıfır tutar kabul edilmiyor.
- [x] Boş vade tarihi kabul edilmiyor.
- [x] Boş kimlik hash kabul edilmiyor.
- [x] Boş maskeli isim kabul edilmiyor.
- [x] İlk alıcı olmayan hesap kabul/red yapamıyor.
- [x] Mevcut sahip olmayan hesap devredemiyor.
- [x] Bekleyen alıcı olmayan hesap devri kabul edemiyor.
- [x] Aracı kurum olmayan hesap çeki ödendi yapamıyor.
- [x] Ödenmiş çek tekrar devredilemiyor.
- [x] Reddedilmiş çek tekrar işleme alınamıyor.
- [x] İptal edilmiş çek tekrar işleme alınamıyor.

---

## UI / Demo Readiness

- [ ] Genel arayüz temiz görünüyor.
- [ ] Kartlar düzgün hizalanmış.
- [x] Butonlar anlaşılır.
- [x] Durum etiketleri anlaşılır.
- [x] Yazılar okunabilir.
- [ ] Video kaydında arayüz anlaşılır olur.
- [x] Yatay taşma yok.
- [ ] Mobil/küçük ekranda büyük bozulma yok.(bilmiyorum mobilden girmedim)
- [x] Kullanıcıya ham blockchain hata mesajı gösterilmiyor.
- [x] Demo 1-2 dakikalık video için uygun görünüyor.

---

# 13. Hata Bulunca Ne Yazılmalı?

Tester bir hata bulursa şunları not almalıdır:

```txt
Hangi adımda hata oldu?
Hangi hesap bağlıydı?
Hangi butona basıldı?
Ne olması bekleniyordu?
Ne oldu?
Ekran görüntüsü var mı?
Tarayıcı console hatası var mı?
Hardhat terminalinde hata var mı?
```

Örnek:

```txt
Adım: Account #2 ile çeki kabul etme
Bağlı hesap: Account #2
Beklenen: Durum Aktif olmalıydı
Olan: MetaMask onayından sonra durum değişmedi
Ekran görüntüsü: var
Console hatası: ...
Hardhat hatası: ...
```

---

# 14. Test Başarılı Sayılma Kriteri

Aşağıdaki ana akış çalışıyorsa Sprint 1 demo başarılı kabul edilir:

```txt
Account #1 çek oluşturur
Account #2 çeki kabul eder
Account #2 çeki Account #3’e devreder
Account #3 devri kabul eder
Account #3 çeki ödemeye gönderir
Account #0 çeki ödendi yapar
İşlem geçmişi tüm adımları gösterir
Çeki Oluşturan Özeti görünür
```

Tüm kritik checkboxlar işaretlenirse demo video çekimine hazırdır.

---

# 15. Sıkça Sorulan Sorular / Sorun Giderme

**Soru:** Hardhat (Terminal 1) ekranını yanlışlıkla kapatıp tekrar açtım. Şimdi MetaMask üzerinden işlem yaparken "Internal JSON-RPC Error" veya "Nonce too high" hatası alıyorum, ne yapmalıyım?

**Çözüm:** Hardhat'i kapatıp açtığınızda blockchain ağı sıfırlanır ancak MetaMask eski işlem sırasını (nonce) hatırladığı için kafası karışır. Bu durumu çözmek için:
1. MetaMask uzantısını açın.
2. Sağ üstten ayarlara girin.
3. **Gelişmiş** (Advanced) sekmesine tıklayın.
4. **Hesap Etkinliğini Temizle** (Clear Activity / Reset Account) butonuna basın.
Bunu hata veren her hesap için tekrarladığınızda sorun çözülecektir.

---

# 16. Kısa Sonuç

Bu test tamamlandığında tester şu kararı vermelidir:

```txt
Demo çalışıyor / çalışmıyor.
Ana akış tamamlandı / tamamlanmadı.
Hata varsa hangi adımda olduğu belirtildi.
```


çeki düzenleyen = keşideci
adına çek düzenlenen = lehtar
çek devir işlemi = cirolamak(butonda ciro et diye görünsün)
çeki devralan kişi = ciranta

solda açılır kapanır panel olsun;
çeklerim(düzenlediğim çekleri göreyim)
çek düzenle(oluşturmak için)
alacaklarım(adıma düzenlenen veya cirolanan çekler burada görünsün)

çek başarı oranına reddedilen veya iptal edilen çekler hesap edilmesin
ödenen toplam çek tutarı görünmeli, burada iki ayrım var bir vadesi gelmiş ödenmiş çek tutarı toplamı ve henüz vadesi gelmemiş ama aktif çek tutarı
 
çek ilk sahibine geri dönünce sistemde aynı çekten iki tane oluşmasın

çek düzenlenirken vade bugünün tarihinden sonra seçilmek zorunda olmalı aksi takdirde çek hükümsüz olur.

ödemeye gönder yerine tahsile gönder yazsın

aracı kurum ekranında çeki tahsil edildi veya yazıldı(ödenmedi) olmalı

sol paneldeki sekmeleirn yanı sıra ortadaki boş alanda kişinin özeti görünsün
