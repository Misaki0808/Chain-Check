> **Archived after documentation merge**

# API Contract — ChainCheck Dijital Çek Projesi

> **⚠️ Bu dosya Sprint 2 hazırlığıdır. Sprint 1 sırasında AI agent bu dosyayı okumamalı ve bu dosyaya göre kod üretmemelidir.**

## Sprint Durumu

```txt
Current Sprint: SPRINT_1
API Status: LOCKED
```

API kodu yalnızca kullanıcı açıkça Sprint 2'ye geçtiğini söylediğinde yazılabilir.

---

## Sprint 2 API Özeti

### Base URL

```txt
http://localhost:5000/api
```

### Response Formatı

```json
{ "success": true, "data": {}, "message": "İşlem başarılı." }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Geçersiz veri." } }
```

### Önerilen Endpoint'ler

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | /api/health | Backend durumu |
| POST | /api/measurements | İşlem süresi kaydet |
| GET | /api/measurements | Ölçüm listele |
| GET | /api/measurements/summary | Ölçüm özeti |
| POST | /api/cheques/:id/metadata | Çek metadata kaydet |
| GET | /api/cheques/:id/metadata | Çek metadata getir |
| GET | /api/institution/payment-requests | Ödemeye gönderilmiş çekler |
| POST | /api/events/sync | Event senkronizasyonu |

### Minimum Sprint 2 Kapsamı

Önce sadece measurement endpoint'leri: `POST /measurements`, `GET /measurements`, `GET /measurements/summary`. Metadata ve event sync sonraya bırakılabilir.

### Action Types

```txt
CHEQUE_CREATED, CHEQUE_ACCEPTED, CHEQUE_REJECTED, TRANSFER_REQUESTED,
TRANSFER_ACCEPTED, TRANSFER_REJECTED, PAYMENT_REQUESTED, CHEQUE_PAID, CHEQUE_CANCELLED
```

### Frontend-Backend İlişkisi

```txt
Blockchain işlemleri: Frontend → MetaMask → Smart Contract
Off-chain kayıtlar: Frontend → Backend API → PostgreSQL
```

Frontend transaction yaptıktan sonra backend'e chequeId, actionType, txHash, durationMs, actorWallet gönderir.

### Güvenlik

API şunları kabul etmemelidir: private key, seed phrase, gerçek TC/VKN, banka/kart bilgisi, şifre. Wallet address based identity kullanılır.