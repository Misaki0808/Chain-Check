> **Archived after documentation merge**

# Frontend Agent Rules — ChainCheck Dijital Çek Projesi

## 1. Bu Dosyanın Amacı

Bu dosya ChainCheck projesinin frontend geliştirme kurallarını belirler. AI frontend görevi aldığında bu dosyayı okumalıdır.

Sprint 1 yasakları ve genel kurallar için AGENTS.md'ye bakınız.

---

## 2. Sprint 1 Frontend Teknolojileri

```txt
React + Vite + JavaScript
ethers.js v6
MetaMask
CSS (basit, framework zorunlu değil)
React Router opsiyonel (birden fazla sayfa gerekirse)
```

Kullanılmayacaklar: Backend API, database, authentication, Redux/Zustand, Next.js, TypeScript zorunluluğu, UI framework (Material UI, Ant Design, Chakra UI, Tailwind, Bootstrap — kullanıcı isterse eklenebilir).

---

## 3. Önerilen Frontend Klasör Yapısı

```txt
frontend/src/
  main.jsx
  App.jsx
  abi/DigitalCheque.json
  config/contract.js
  components/
    WalletConnect.jsx, ChequeForm.jsx, ChequeList.jsx,
    ChequeDetail.jsx, StatusBadge.jsx, TransactionInfo.jsx,
    HistoryTimeline.jsx, RoleInfo.jsx
  pages/
    Dashboard.jsx, CreateCheque.jsx,
    ChequeDetailPage.jsx, InstitutionPanel.jsx
  utils/
    formatAddress.js, formatAmount.js, formatDate.js,
    hashIdentity.js, measureTransaction.js, statusLabels.js
```

---

## 4. Sayfalar

### Dashboard
Ana ekran. Bağlı cüzdan adresini gösterir, kullanıcının çeklerini listeler, yeni çek oluşturma ve aracı kurum paneline yönlendirir.

### CreateCheque
Form alanları: ilk alıcı wallet adresi, tutar, vade tarihi, maskeli alıcı adı, kimlik hash temsili. Gerçek TC/VKN alınmaz.

### ChequeDetailPage
Çek ID, oluşturan/ilk alıcı/mevcut sahip adresleri, tutar, vade, durum, işlem geçmişi, devir geçmişi, rolüne göre işlem butonları, son işlem hash/süresi.

### InstitutionPanel
Ödemeye gönderilmiş çekleri gösterir. Sadece aracı kurum hesabı bağlıysa ödeme kapatma butonu gösterir. Yetkisiz kullanıcıya uyarı mesajı gösterilir.

---

## 5. Rol Bazlı Buton Gösterimi

| Rol | Durum | Butonlar |
|---|---|---|
| İlk Alıcı | Onay Bekliyor | Kabul Et, Reddet |
| Mevcut Sahip | Aktif | Devret, Ödemeye Gönder |
| Yeni Alıcı | Devir Bekliyor | Devri Kabul Et, Devri Reddet |
| Aracı Kurum | Ödemeye Gönderildi | Ödendi Olarak İşaretle |

Yetkisiz kullanıcıya işlem butonu gösterilmemelidir.

---

## 6. MetaMask Bağlantısı

Frontend şu kontrolleri yapmalıdır:
- `window.ethereum` var mı?
- Kullanıcı cüzdanı bağladı mı?
- Bağlı hesap adresi nedir?
- Doğru network'te mi? (Hardhat chain ID: `31337`)

MetaMask yoksa: `"MetaMask bulunamadı. Lütfen MetaMask eklentisini yükleyin."`
Yanlış ağdaysa: `"Lütfen MetaMask üzerinde Hardhat Local Network ağına geçin."`

Private key / seed phrase hiçbir durumda istenmez.

---

## 7. Contract Bağlantısı

```javascript
// src/config/contract.js
export const CONTRACT_ADDRESS = "0x...";
```

ABI dosyası: `src/abi/DigitalCheque.json`

ethers.js v6 ile okuma → provider, yazma → signer kullanılır. Contract deploy değişikliğinde ABI ve address güncellenmelidir.

---

## 8. Transaction İşlem Akışı

1. Kullanıcı butona basar
2. Başlangıç zamanı alınır (`Date.now()`)
3. MetaMask transaction açılır
4. Kullanıcı onaylar
5. Transaction gönderilir → hash alınır
6. `tx.wait()` ile confirm beklenir
7. Bitiş zamanı alınır, süre hesaplanır
8. UI güncellenir

Örnek gösterim:
```txt
İşlem başarılı.
İşlem Hash'i: 0x...
İşlem Süresi: 4.82 saniye
```

Bu süre demo ölçümüdür. Gerçek banka ödeme süresi olarak sunulmamalıdır.

---

## 9. Durum Etiketleri

```javascript
// src/utils/statusLabels.js
export const STATUS_LABELS = {
  0: "Onay Bekliyor",
  1: "Aktif",
  2: "Reddedildi",
  3: "Devir Bekliyor",
  4: "Ödemeye Gönderildi",
  5: "Ödendi",
  6: "İptal Edildi",
};
```

Enum sayıları doğrudan kullanıcıya gösterilmemelidir.

---

## 10. Gösterim Formatları

- **Adres:** Kısaltılmış `0x1234...abcd`, detayda tam adres kopyalanabilir
- **Tutar:** `₺25.000` formatında (gerçek para transferi yok)
- **Tarih:** `20.06.2026` formatında (Unix timestamp → insan okunur)
- **Kimlik hash:** `Kimlik Hash: 0x8a3f...91bc` (demo verisi)
- **Maskeli isim:** `Ahmet Y.` (gerçek kişi bilgisi değil)

---

## 11. Hata Mesajları

Sade Türkçe kullanılmalıdır. Ham blockchain hataları kullanıcıya basılmamalıdır.

| Durum | Mesaj |
|---|---|
| Yetkisiz işlem | Bu işlemi yapmaya yetkiniz yok. |
| Geçersiz durum | Bu çek şu anda devredilemez. |
| Zaten ödenmiş | Bu çek zaten ödenmiş. |
| MetaMask iptal | MetaMask işlemi kullanıcı tarafından iptal edildi. |
| Genel hata | İşlem başarısız oldu. Lütfen tekrar deneyin. |

---

## 12. Loading ve Başarı Durumları

Loading: `"İşlem bekleniyor..."`, `"MetaMask onayı bekleniyor..."`, `"Blockchain onayı bekleniyor..."`

Başarı: `"Çek başarıyla oluşturuldu."`, `"Çek kabul edildi."`, `"Devir talebi oluşturuldu."` vb. + işlem hash'i gösterilir.

Kullanıcı aynı anda aynı butona tekrar basamamalıdır.

---

## 13. Form Validasyonları

Çek oluşturma formunda:
- İlk alıcı adresi boş olmamalı ve geçerli Ethereum adresi olmalı
- Tutar sıfırdan büyük olmalı
- Vade tarihi boş olmamalı
- Maskeli alıcı adı boş olmamalı
- Kimlik hash temsili boş olmamalı

Geçersiz veri contract'a gönderilmemelidir.

---

## 14. State Management

Sprint 1'de Redux/Zustand kullanılmamalıdır. React'in kendi state yapısı yeterlidir: `useState`, `useEffect`, `useMemo`, `useCallback`.

Gerekirse basit custom hook'lar yazılabilir: `useWallet`, `useContract`, `useCheques`.

---

## 15. İşlem Geçmişi Gösterimi

Timeline şeklinde gösterilebilir:

```txt
10:32 — Çek oluşturuldu
10:33 — İlk alıcı çeki kabul etti
10:35 — Devir talebi oluşturuldu
10:36 — Yeni alıcı devri kabul etti
10:38 — Ödeme talebi başlatıldı
10:39 — Aracı kurum çeki ödendi olarak işaretledi
```

---

## 16. Kodlama Stili

- Component isimleri PascalCase, utility fonksiyonları camelCase
- Gereksiz abstraction yapma, dosyalar büyürse böl
- Console loglar final demo öncesi temizlenmeli
- Kullanıcıya ham hata basılmamalı