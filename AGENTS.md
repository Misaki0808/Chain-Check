# AGENTS.md — ChainCheck AI Agent Ana Talimat Dosyası

## 1. Bu Dosyanın Amacı

Bu dosya, ChainCheck projesinde çalışan AI kodlama ajanları için ana yönlendirme dosyasıdır. AI herhangi bir işlem yapmadan önce bu dosyayı okumalıdır.

---

## 2. Aktif Sprint ve Sprint Kilidi

```txt
CURRENT_SPRINT = SPRINT_1
```

AI yalnızca aktif sprint kapsamında çalışmalıdır. Sprint değiştirmek için kullanıcı açıkça `"Sprint 1 tamamlandı, Sprint 2'ye geçiyoruz."` demelidir. Bu ifade yoksa AI aktif sprint dışına çıkamaz. `LOCKED` durumundaki sprintler uygulanamaz.

---

## 3. Sprint 1 Kararları ve Yasaklar

**Teknoloji Stack:** React + Vite + JavaScript, Solidity + Hardhat Local Network, MetaMask + ethers.js v6, Custom Solidity Smart Contract.
**Source of Truth:** Smart Contract.

**Sprint 1'de KESİNLİKLE YAPILMAYACAKLAR:**
- Backend, database, API server kurmak
- JWT authentication, login/register sistemi
- ERC-721, ERC-1155, ERC-3643 uygulamak
- Gerçek banka entegrasyonu, gerçek para transferi yapmak
- Gerçek TC/VKN verisi saklamak (Yalnızca hash temsili)
- Gerçek kişi adları kullanmak (Maskeli isim kullanılacak: Ahmet Y.)
- Kullanıcıdan private key veya seed phrase istemek
- Kullanıcı onayı olmadan paket kurmak, mimari değiştirmek, deployment yapmak

---

## 4. Görev Sınıflandırma ve Doküman Yönlendirme

AI her görevde önce görev türünü belirlemeli, sonra **sadece ilgili aktif dokümanları** okumalıdır. `docs/archive/*` altındaki dosyalar kesinlikle okunmamalıdır.

**Sprint 1 Sırasında Okunacak Aktif Dosyalar:**
- `docs/project-spec.md` : Proje amacı, mimari, klasör yapısı, sprint 1 kapsamı.
- `docs/blockchain.md` : Smart contract mantığı, veri modeli, event'ler.
- `docs/frontend.md` : React/Vite ayarları, sayfalar, formlar, rol bazlı UI.
- `docs/qa-and-demo.md` : Test checklist'i, demo hesapları, video akışı.

**Sprint 1 Sırasında OKUNMAYACAK Dosya:**
- `docs/sprint2-draft.md` : Backend ve DB hazırlığıdır, Sprint 2'ye kadar kilitlidir.

---

## 5. Kullanıcı Arayüzü Dil Kuralları

Frontend arayüzü Türkçe olmalıdır:
- Keşideci → Çeki Oluşturan
- Lehtar → İlk Alıcı
- Hamil → Mevcut Sahip
- Ciro → Devret
- Tahsilat → Ödemeye Gönder
- Banka → Aracı Kurum
- Settled → Ödendi
- Burn → İptal Edildi

---

## 6. Kod Yazma Akışı

1. `AGENTS.md` ve `docs/project-spec.md` oku.
2. Görev türüne göre diğer aktif MD dosyalarından birini oku.
3. Görevin aktif sprint (Sprint 1) kapsamında olduğunu belirt.
4. Kod yazdıktan sonra şu bilgileri ver: Değiştirilen dosyalar, Ne değiştirildi, Nasıl test edilir.