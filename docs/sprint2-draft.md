# Backend, API ve Database — Sprint 2 Hazırlığı

> **⚠️ DİKKAT: Bu dosya Sprint 2 taslağıdır. Sprint 1 sırasında AI agent bu dosyayı okumamalı ve bu dosyaya göre kod üretmemelidir.**
> Sprint 1'de backend, database ve API entegrasyonu KESİNLİKLE YAPILMAYACAKTIR.

---

## 1. Sprint 2 Önerilen Teknoloji Stack

- **Backend:** Node.js + Express + JavaScript
- **Database:** PostgreSQL + Prisma ORM
- **Blockchain Interface:** ethers.js v6

## 2. Mimari Yaklaşım ve Sınırlar

- **Source of Truth:** Primary = Smart Contract, Secondary = PostgreSQL (off-chain destek). Backend, blockchain ile çelişen veri üretmemelidir.
- **Görev:** Maskeli isimler, TC/VKN hash kayıtları, işlem süresi ölçümleri (MeasurementLog), raporlama ve aracı kurum paneli için off-chain veri sağlamak.
- **Güvenlik Sınırları:** Backend private key veya seed phrase saklamaz, işlem imzalamaz. Gerçek TC/VKN, banka veya kart bilgisi saklamaz. Authentication (gerekirse) cüzdan adresi tabanlı olur.

## 3. Önerilen Database Modeli (Prisma)

Sprint 2'de ilk olarak `MeasurementLog` oluşturulacaktır.

- `MeasurementLog`: `id`, `chequeId`, `actionType`, `txHash`, `durationMs`, `actorWallet`, `createdAt`
- Action types: `CHEQUE_CREATED`, `CHEQUE_ACCEPTED`, `TRANSFER_REQUESTED`, `PAYMENT_REQUESTED`, `CHEQUE_PAID` vb.
- Gerekirse sonradan eklenecekler: `ChequeMetadata` (off-chain veri), `ContractEvent`.

## 4. Önerilen API Endpoint'leri

**Base URL:** `http://localhost:5000/api`

Sprint 2 Başlangıç Kapsamı:
- `GET /health` (Backend durumu)
- `POST /measurements` (İşlem süresi kaydetme)
- `GET /measurements/summary` (Süre özeti)

Sonraki Aşamalar:
- `POST /cheques/:id/metadata`
- `GET /institution/payment-requests`

Frontend, MetaMask üzerinden transaction başarıyla onaylandıktan (`tx.wait()`) sonra süreyi ölçüp `POST /measurements` ile backend'e gönderecektir.
