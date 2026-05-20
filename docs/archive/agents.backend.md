> **Archived after documentation merge**

# Backend Agent Rules — ChainCheck Dijital Çek Projesi

> **⚠️ Bu dosya Sprint 2 hazırlığıdır. Sprint 1 sırasında AI agent bu dosyayı okumamalı ve bu dosyaya göre kod üretmemelidir.**

## Sprint Durumu

```txt
Current Sprint: SPRINT_1
Backend Status: LOCKED
```

Backend kodu yalnızca kullanıcı açıkça `"Sprint 1 tamamlandı, Sprint 2'ye geçiyoruz."` dediğinde yazılabilir.

---

## Sprint 2 Backend Özeti

### Önerilen Stack

```txt
Node.js + Express + JavaScript
PostgreSQL + Prisma ORM
ethers.js v6
```

Alternatif: FastAPI + Python + SQLAlchemy (kullanıcı isterse).

### Backend'in Görevi

Backend blockchain'in yerine geçmez. Yalnızca off-chain destek katmanıdır:
- Maskeli kullanıcı isimleri, TC/VKN hash kayıtları
- Transaction hash ve işlem süresi ölçümleri
- Smart contract event kopyaları
- Raporlama verisi, aracı kurum panel desteği

### Source of Truth

```txt
Primary = Smart Contract
Secondary = Backend + Database
```

Backend smart contract verisiyle çelişen durum üretmemelidir.

### Temel Kurallar

- Transaction imzalamaz, private key/seed phrase saklamaz
- Gerçek TC/VKN, banka bilgisi, kart bilgisi saklamaz
- Sprint 2'de bile karmaşık authentication zorunlu değil (wallet address based identity)
- Microservice yapısı kurulmaz

### Önerilen Klasör Yapısı

```txt
backend/
  server.js
  src/
    app.js
    config/ (database.js, blockchain.js)
    routes/ (cheque, measurement, institution)
    controllers/
    services/ (blockchain, event-listener, measurement)
    middlewares/ (error, validation)
  prisma/schema.prisma
```

### Önerilen Geliştirme Sırası

1. Express server + health endpoint
2. PostgreSQL + Prisma + MeasurementLog model
3. Measurement kayıt/listeleme/summary endpoint'leri
4. Frontend işlem sonrası measurement gönderimi
5. Gerekirse ChequeMetadata ve ContractEvent ekle

API endpoint detayları için `docs/api-contract.md`, database modeli için `docs/database.md` dosyasına bakınız.