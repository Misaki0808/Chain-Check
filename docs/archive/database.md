> **Archived after documentation merge**

# Database — ChainCheck Dijital Çek Projesi

> **⚠️ Bu dosya Sprint 2 hazırlığıdır. Sprint 1 sırasında AI agent bu dosyayı okumamalı ve bu dosyaya göre kod üretmemelidir.**

## Sprint Durumu

```txt
Current Sprint: SPRINT_1
Database Status: LOCKED
```

Database kodu yalnızca kullanıcı açıkça Sprint 2'ye geçtiğini söylediğinde yazılabilir.

---

## Sprint 2 Database Özeti

### Önerilen Stack

```txt
PostgreSQL + Prisma ORM
```

### Source of Truth

```txt
Primary = Smart Contract
Secondary = PostgreSQL (off-chain destek verisi)
```

Database smart contract ile çelişen veri üretmemelidir.

### Önerilen Modeller

| Model | Amaç | Sprint 2 Önceliği |
|---|---|---|
| MeasurementLog | İşlem süresi ölçümleri | Yüksek (ilk yapılacak) |
| ChequeMetadata | Off-chain çek yardımcı verisi | Orta |
| ContractEvent | Smart contract event kopyaları | Düşük |
| User | Wallet bazlı basit kullanıcı | Düşük |

### MeasurementLog Modeli (Öncelikli)

```txt
id, chequeId, actionType, txHash, durationMs, actorWallet, createdAt
```

Action types: `CHEQUE_CREATED`, `CHEQUE_ACCEPTED`, `CHEQUE_REJECTED`, `TRANSFER_REQUESTED`, `TRANSFER_ACCEPTED`, `TRANSFER_REJECTED`, `PAYMENT_REQUESTED`, `CHEQUE_PAID`, `CHEQUE_CANCELLED`

### ChequeMetadata Modeli

```txt
id, chequeId (unique), maskedReceiverName, identityHash, lastKnownStatus, lastTxHash, createdAt, updatedAt
```

### Geliştirme Sırası

1. PostgreSQL + Prisma kurulumu
2. MeasurementLog model → migration
3. Measurement endpoint'leri (kayıt/listeleme/özet)
4. Frontend işlem sonrası measurement gönderimi
5. Gerekirse ChequeMetadata → ContractEvent → User ekle

### Güvenlik

Database **saklamayacaklar:** gerçek TC/VKN, açık ad-soyad, private key, seed phrase, banka/kart bilgisi. Yalnızca maskeli isimler ve hash temsilleri saklanır.

### Environment

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chaincheck"
```

`.env` Git'e eklenmemelidir. `.env.example` oluşturulabilir.