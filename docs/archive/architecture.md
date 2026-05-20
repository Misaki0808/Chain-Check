> **Archived after documentation merge**

# Architecture — ChainCheck Dijital Çek Projesi

## 1. Bu Dosyanın Amacı

Bu dosya ChainCheck projesinin Sprint 1 teknik mimarisini açıklar. Klasör yapısı, veri akışı, bileşen sorumlulukları ve source of truth mantığını belirler.

Bu dosya kullanıcı onayı olmadan değiştirilmemelidir.

---

## 2. Sprint 1 Genel Mimari

```txt
React Frontend → ethers.js → MetaMask → Hardhat Local Network → Solidity Smart Contract
```

Sprint 1'de backend, database, gerçek banka entegrasyonu ve gerçek para transferi yoktur.

Tam yasak listesi ve sprint kuralları için AGENTS.md'ye bakınız.

---

## 3. Veri Kaynağı (Source of Truth)

```txt
Source of truth = Smart Contract
```

Frontend yalnızca smart contract'tan veri okur ve smart contract'a işlem gönderir. Frontend local state kullanabilir ama kalıcı veri kaynağı olarak davranmamalıdır.

Sprint 2'de backend/database eklense bile smart contract primary source of truth olarak kalmalıdır.

---

## 4. Önerilen Proje Klasör Yapısı

```txt
chaincheck/
  AGENTS.md

  docs/
    project-brief.md
    sprint-plan.md
    architecture.md
    blockchain.md
    agents.frontend.md
    agents.backend.md
    api-contract.md
    database.md
    demo-script.md
    test-plan.md

  contracts/
    DigitalCheque.sol

  scripts/
    deploy.js

  test/
    DigitalCheque.test.js

  frontend/
    package.json
    vite.config.js
    index.html

    src/
      main.jsx
      App.jsx

      abi/
        DigitalCheque.json

      config/
        contract.js

      components/
        WalletConnect.jsx
        ChequeForm.jsx
        ChequeList.jsx
        ChequeDetail.jsx
        StatusBadge.jsx
        TransactionInfo.jsx

      pages/
        Dashboard.jsx
        CreateCheque.jsx
        ChequeDetailPage.jsx
        InstitutionPanel.jsx

      utils/
        formatAddress.js
        hashIdentity.js
        measureTransaction.js
        statusLabels.js

  hardhat.config.js
  package.json
  README.md
```

Bu yapı değiştirilebilir ancak kullanıcı onayı olmadan ana mimari değiştirilmemelidir.

---

## 5. Sistem Bileşenleri

### Frontend

Kullanılan teknolojiler: React, Vite, JavaScript, ethers.js v6, MetaMask. React Router opsiyonel (birden fazla sayfa gerekirse).

Frontend'in görevleri: cüzdan bağlantısı, çek oluşturma/listeleme/detay, kabul/red/devir/ödeme işlemleri, transaction hash ve süre gösterimi, durum geçmişi gösterimi.

Frontend'in **yapmaması** gerekenler: gerçek TC/VKN saklamak, backend varmış gibi davranmak, smart contract dışında ayrı source of truth oluşturmak.

Detaylı frontend kuralları için `docs/agents.frontend.md` dosyasına bakınız.

### Smart Contract

Kullanılan teknoloji: Solidity, Hardhat, Custom Smart Contract.

Smart contract'ın görevleri: dijital çek CRUD, durum yönetimi, yetki kontrolleri, devir/ödeme/iptal akışları, event üretimi.

Detaylı smart contract kuralları, veri modeli ve fonksiyonlar için `docs/blockchain.md` dosyasına bakınız.

### MetaMask

Kullanıcı işlemlerini imzalar. Private key istenmez. Connect wallet → transaction sign → hash display akışı izlenir.

### Hardhat Local Network

Sprint 1 demo blockchain ağı. Gas/token derdi olmadan test, hızlı transaction, local demo videosu çekimi.

---

## 6. Temel İş Akışı

1. Kullanıcı cüzdanını bağlar
2. Tutar, vade tarihi, ilk alıcı adresi, maskeli isim, TC/VKN hash girer
3. MetaMask ile işlemi imzalar
4. Çek "Onay Bekliyor" durumunda blockchain'e kaydedilir
5. İlk alıcı kabul ederse → "Aktif", reddederse → "Reddedildi"
6. Mevcut sahip devretmek isterse → "Devir Bekliyor"
7. Yeni alıcı kabul ederse → "Aktif" (yeni sahip), reddederse → "Aktif" (eski sahip kalır)
8. Mevcut sahip ödeme talebi başlatırsa → "Ödemeye Gönderildi"
9. Aracı kurum kapatırsa → "Ödendi"
10. Çek ilk oluşturan kişiye dönerse → "İptal Edildi" durumuna alınabilir

---

## 7. İşlem Süresi Ölçümü

Frontend tarafında her blockchain işlemi için süre ölçülür. Detaylar `docs/agents.frontend.md` dosyasında.

Bu ölçüm demo gözlemi olarak kullanılabilir. Gerçek banka ödeme süresi olarak sunulmamalıdır.

---

## 8. Backend Olmadan Çalışma Mantığı

Sprint 1'de backend olmadığı için: kullanıcı işlemleri doğrudan smart contract'a gider, veri smart contract'tan okunur, kullanıcı hesabı wallet adresiyle temsil edilir, aracı kurum özel bir wallet adresiyle temsil edilir. Bu yaklaşım demo için bilinçli olarak seçilmiştir.

---

## 9. Gelecek Sprintler

Sprint 2'de gerekirse off-chain destek için backend + database eklenebilir. Sprint 3'te gerekirse token standardı değerlendirilebilir. Detaylar `docs/sprint-plan.md` ve ilgili dosyalarda.