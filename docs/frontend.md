# Frontend Agent Rules — ChainCheck Dijital Çek Projesi

## 1. Teknolojiler ve Sınırlar

- **Kullanılacaklar:** React + Vite + JavaScript, ethers.js v6, MetaMask, CSS (basit, framework opsiyonel), React Router (opsiyonel).
- **Kullanılmayacaklar:** Backend API, database, authentication, Redux/Zustand, Next.js, TypeScript zorunluluğu.
- Genel sprint yasakları için `AGENTS.md` dosyasına bakınız.

## 2. Sayfalar ve Bileşenler

- **Dashboard:** Bağlı cüzdan adresini gösterir, çekleri listeler, oluşturma/aracı kurum sayfalarına yönlendirir.
- **CreateCheque:** İlk alıcı wallet adresi, tutar, vade tarihi, maskeli alıcı adı, kimlik hash temsili alanlarını içerir.
- **ChequeDetailPage:** Çek bilgileri, işlem/devir geçmişi, rol bazlı butonlar, son işlem hash/süresi.
- **InstitutionPanel:** Ödemeye gönderilmiş çekler. Sadece aracı kurum bağlıysa "Ödendi Olarak İşaretle" butonu çıkar.

## 3. Rol Bazlı Buton Gösterimi

| Rol | Çek Durumu | Butonlar |
|---|---|---|
| İlk Alıcı | Onay Bekliyor | Kabul Et, Reddet |
| Mevcut Sahip | Aktif | Devret, Ödemeye Gönder |
| Yeni Alıcı | Devir Bekliyor | Devri Kabul Et, Devri Reddet |
| Aracı Kurum | Ödemeye Gönderildi | Ödendi Olarak İşaretle |

Yetkisiz kullanıcıya hiçbir işlem butonu gösterilmemelidir.

## 4. MetaMask ve Contract Bağlantısı

- **Kontroller:** `window.ethereum` var mı? Bağlı mı? Doğru ağda mı? (Hardhat Chain ID: 31337).
- Hata mesajları: "MetaMask bulunamadı.", "Lütfen Hardhat Local Network ağına geçin."
- **Contract:** `src/config/contract.js` içinde adres, `src/abi/DigitalCheque.json` içinde ABI tutulur. ethers.js v6 `BrowserProvider` ve `Signer` kullanılır.

## 5. İşlem Süresi Ölçümü

Her blockchain işlemi (transaction) gönderildiğinde:
1. `Date.now()` ile başlangıç alınır.
2. `tx.wait()` ile confirm beklenir.
3. Bitiş zamanı ile süre saniye cinsinden hesaplanıp UI'da gösterilir.
*(Bu ölçüm gerçek banka süresi olarak sunulmamalıdır, sadece demo gözlemidir.)*

## 6. Durum Etiketleri ve Gösterim Formatları

- Durumlar: Onay Bekliyor, Aktif, Reddedildi, Devir Bekliyor, Ödemeye Gönderildi, Ödendi, İptal Edildi. Enum sayıları kullanıcıya gösterilmez.
- Adres: `0x1234...abcd`
- Tutar: `₺25.000` (gerçek para transferi yok)
- Tarih: `20.06.2026`
- Hata/Loading/Success mesajları sade ve Türkçe olmalıdır. Ham blockchain hataları (revert sebepleri hariç) UI'da gizlenmelidir.

## 7. Form Validasyonları ve State

- Geçersiz veri (boş adres, tutar <= 0, boş isim/hash) contract'a gönderilmemelidir.
- State yönetimi `useState`, `useEffect`, `useMemo` ve custom hook'lar (`useWallet`, `useContract`) ile yapılır. Redux kullanılmaz.
- Aynı anda butona çift tıklamayı engellemek için loading stateleri kullanılmalıdır.
