> **Archived after documentation merge**

# Sprint Plan — ChainCheck Dijital Çek Projesi

## 1. Mevcut Aktif Sprint

```txt
CURRENT_SPRINT = SPRINT_1
```

Şu anda yalnızca Sprint 1 aktiftir. Sprint 2 ve Sprint 3 kilitlidir.

---

# Sprint 1 — Local Çalışan Demo

```txt
Status: ACTIVE
```

## Ana Hedef

Local ortamda çalışan, video kaydı alınabilir, stabil bir demo sürümü geliştirmek. Hedef mükemmel ürün değil, temel çek akışını blockchain üzerinde sorunsuz gösteren bir prototip.

## Kullanılacak Teknolojiler

- React + Vite + JavaScript
- Solidity + Hardhat + Hardhat Local Network
- MetaMask + ethers.js v6
- Custom Solidity Smart Contract
- React Router opsiyonel (birden fazla sayfa gerekirse)

## Sprint 1 Kapsamı

- MetaMask cüzdan bağlama
- Dijital çek oluşturma (tutar, vade tarihi, ilk alıcı, maskeli isim, TC/VKN hash)
- Çekin blockchain'de "Onay Bekliyor" durumuna geçmesi
- İlk alıcının çeki kabul/reddetmesi
- Kabul edilen çekin "Aktif" durumuna geçmesi
- Mevcut sahibin çeki başka bir kişiye devretmesi
- Yeni alıcının devri kabul/reddetmesi
- Mevcut sahibin ödeme talebi başlatması
- Aracı kurumun çeki "Ödendi" durumuna çekmesi
- Çekin ilk oluşturan kişiye geri dönmesi halinde "İptal Edildi" durumuna alınması
- İşlem hash ve işlem süresi gösterimi
- Çek durum ve devir geçmişi gösterimi

## Sprint 1 Dışında Kalanlar

Backend, database, gerçek banka entegrasyonu, gerçek para transferi, gerçek TC/VKN kaydı, kullanıcı kayıt/giriş sistemi, JWT authentication, ERC-721/ERC-1155/ERC-3643, production deployment.

## Çek Durumları

```txt
Onay Bekliyor → Aktif → Devir Bekliyor → Aktif → Ödemeye Gönderildi → Ödendi
                 ↘ Reddedildi                                         ↗ İptal Edildi
```

| Contract Status | Frontend Label |
|---|---|
| PendingApproval | Onay Bekliyor |
| Active | Aktif |
| Rejected | Reddedildi |
| TransferPending | Devir Bekliyor |
| PaymentRequested | Ödemeye Gönderildi |
| Paid | Ödendi |
| Cancelled | İptal Edildi |

## Kullanıcı Arayüz Terimleri

AGENTS.md §9 dil tablosuna bakınız.

## Sprint 1 Başarı Kriterleri

- [ ] React uygulaması localde açılıyor
- [ ] MetaMask bağlantısı çalışıyor
- [ ] Hardhat local network çalışıyor
- [ ] Smart contract local ağa deploy ediliyor
- [ ] Çek oluşturulabiliyor
- [ ] Çek listelenebiliyor ve detay görüntülenebiliyor
- [ ] İlk alıcı çeki kabul/reddedebiliyor
- [ ] Çek devredilebiliyor ve yeni alıcı devri kabul/reddedebiliyor
- [ ] Ödeme talebi başlatılabiliyor
- [ ] Aracı kurum çeki "Ödendi" durumuna çekebiliyor
- [ ] Çek "İptal Edildi" durumuna alınabiliyor
- [ ] İşlem hash'i ve süresi gösteriliyor
- [ ] Çek geçmişi gösteriliyor
- [ ] Demo videosu çekilebilir durumda

---

# Sprint 2 — Backend ve Database Genişletmesi

```txt
Status: LOCKED
```

Kullanıcı açıkça Sprint 2'ye geçildiğini söylemeden backend/database geliştirmesi yapılmayacaktır.

**Özet:** Sprint 1 sonrası gerekirse off-chain metadata, işlem süresi ölçümleri ve raporlama desteği için backend + database eklenebilir. Önerilen stack: Node.js + Express + PostgreSQL + Prisma. Detaylar için `docs/agents.backend.md`, `docs/api-contract.md`, `docs/database.md` dosyalarına bakınız.

**Sprint 2'de de yapılmayacaklar:** Gerçek banka entegrasyonu, gerçek para transferi, gerçek TC/VKN doğrulama, gerçek KYC sistemi.

---

# Sprint 3 — Token Standardı Genişletmesi

```txt
Status: LOCKED
```

Kullanıcı açıkça Sprint 3'e geçildiğini söylemeden ERC entegrasyonu yapılmayacaktır.

**Özet:** Akademik gereklilik veya hoca talebi halinde çeklerin token standardıyla temsili değerlendirilebilir. Öneri sırası: ERC-721 > ERC-1155 > ERC-3643 (teorik). Detaylar `docs/blockchain.md` dosyasında belirtilmiştir.

---

# Genel Sprint Kuralları

Aktif sprint dışına çıkılmaz. Kodlama öncesi ve sonrası akış kuralları için AGENTS.md §6'ya bakınız.

Sprint 1'de amaç: hızlı ama sağlam çalışan demo çıkarmak. Mimariyi büyütme, gereksiz paket kurma, kullanıcı istemeden yeni özellik üretme.