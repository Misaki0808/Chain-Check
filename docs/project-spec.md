# Project Specification — ChainCheck Dijital Çek Projesi

## 1. Proje Amacı ve Problemi

ChainCheck, geleneksel kağıt tabanlı çek süreçlerini (fiziksel teslim, manuel kontrol, uzun tahsilat süreleri, sahtecilik riski) dijital ortamda modelleyen blockchain tabanlı bir demo uygulamasıdır.
Amaç production seviyesinde bir finansal sistem kurmak değil; localde çalışan, ekran kaydı alınabilir, konferans/makale için gösterilebilir bir demo üretmektir.

## 2. Sprint 1 Kapsamı (Aktif Sprint)

Local ortamda çalışan, video kaydı alınabilir, stabil bir demo sürümü geliştirmek.
- MetaMask cüzdan bağlama
- Dijital çek oluşturma (tutar, vade tarihi, ilk alıcı, maskeli isim, TC/VKN hash)
- Çekin "Onay Bekliyor" durumuna geçmesi, ilk alıcının kabul/reddetmesi
- Kabul edilen çekin "Aktif" durumuna geçmesi ve devredilebilmesi
- Yeni alıcının devri kabul/reddetmesi
- Mevcut sahibin ödeme talebi başlatması ("Ödemeye Gönderildi")
- Aracı kurumun çeki "Ödendi" durumuna çekmesi
- İşlem hash, işlem süresi ve çek durum geçmişi gösterimi

**Sprint 1'de Olmayanlar:** Backend, database, gerçek banka entegrasyonu, gerçek para transferi, ERC standartları, production deployment, authentication. Sprint 2 ve 3 kilitlidir.

## 3. Teknoloji Kararı ve Veri Kaynağı

- **Frontend:** React + Vite + JavaScript, ethers.js v6, MetaMask, React Router (opsiyonel).
- **Blockchain:** Custom Solidity Smart Contract, Hardhat Local Network.
- **Source of Truth:** Yalnızca Smart Contract. Frontend kalıcı state tutmaz.

```txt
React Frontend → ethers.js v6 → MetaMask → Hardhat Local Network → Solidity Smart Contract
```

## 4. Klasör Yapısı

```txt
chaincheck/
  AGENTS.md
  docs/
    project-spec.md
    blockchain.md
    frontend.md
    qa-and-demo.md
    sprint2-draft.md
    archive/
  contracts/
    DigitalCheque.sol
  scripts/
    deploy.js
  test/
    DigitalCheque.test.js
  frontend/
    package.json
    vite.config.js
    src/
      main.jsx, App.jsx
      abi/, config/, components/, pages/, utils/
  hardhat.config.js
```

## 5. Veri Gizliliği ve Güvenlik
- **Kimlik:** TC/VKN sadece hash temsili olarak kaydedilir (`0x8a3f...91bc`). Gerçek isim kullanılmaz, maskeli isim (`Ahmet Y.`) kullanılır.
- **Para:** Gerçek para transferi yoktur. Ödeme süreci sadece durum değişimi olarak modellenir.
- **Private Key:** Kullanıcıdan kesinlikle istenmez.
