# Blockchain — ChainCheck Dijital Çek Projesi

## 1. Bu Dosyanın Amacı

Bu dosya, ChainCheck projesinin blockchain tarafındaki teknik kurallarını belirler: smart contract veri modeli, fonksiyonlar, event'ler, yetki kontrolleri ve geçmiş takibi.

Bu dosyadaki kurallar kullanıcı onayı olmadan değiştirilmemelidir.

---

## 2. Sprint 1 Blockchain Kararı

```txt
Solidity + Hardhat + MetaMask + ethers.js v6 + Custom Smart Contract
```

Sprint 1'de ERC-721/ERC-1155/ERC-3643 uygulanmayacaktır. Tam yasak listesi için AGENTS.md §4'e bakınız.

---

## 3. Temel Yaklaşım

Her dijital çek, smart contract içinde bir kayıt olarak tutulur. Çekler token standardıyla temsil edilmez.

```txt
Source of truth = Smart Contract
Model: chequeId → Cheque struct
```

---

## 4. Smart Contract Dosyası

```txt
/contracts/DigitalCheque.sol
```

Tek ana contract. Kullanıcı açıkça istemedikçe birden fazla ana contract oluşturulmamalıdır.

---

## 5. Temel Veri Modeli

```solidity
struct Cheque {
    uint256 id;
    address creator;
    address firstReceiver;
    address currentOwner;
    address pendingReceiver;
    address intermediary;
    uint256 amount;
    uint256 dueDate;
    string identityHash;
    string maskedReceiverName;
    ChequeStatus status;
    uint256 createdAt;
    uint256 updatedAt;
}
```

| Alan | Anlamı |
|---|---|
| `id` | Çekin benzersiz numarası |
| `creator` | Çeki oluşturan wallet adresi |
| `firstReceiver` | İlk alıcı wallet adresi |
| `currentOwner` | Çekin mevcut sahibi |
| `pendingReceiver` | Devir bekleyen yeni alıcı |
| `intermediary` | Aracı kurum wallet adresi |
| `amount` | Çek tutarı (nominal, gerçek para transferi yok) |
| `dueDate` | Vade tarihi (Unix timestamp) |
| `identityHash` | TC/VKN hash temsili |
| `maskedReceiverName` | Maskeli alıcı adı |
| `status` | Çekin mevcut durumu |
| `createdAt` / `updatedAt` | Zaman bilgileri |

---

## 6. Çek Durumları

```solidity
enum ChequeStatus {
    PendingApproval,
    Active,
    Rejected,
    TransferPending,
    PaymentRequested,
    Paid,
    Cancelled
}
```

Frontend Türkçe etiketleri `docs/sprint-plan.md` durum tablosuna bakınız.

**Final durumlar:** `Rejected`, `Paid`, `Cancelled` — bu durumda yeni işlem yapılamaz.

---

## 7. Mapping ve Sayaç

```solidity
mapping(uint256 => Cheque) public cheques;
uint256 public chequeCounter;
mapping(address => uint256[]) private userCheques;
```

---

## 8. Roller

Roller wallet adresleriyle temsil edilir. Sprint 1'de kullanıcı kayıt sistemi yoktur.

- **Çeki Oluşturan:** `msg.sender` (createCheque çağıran)
- **İlk Alıcı:** Çek oluşturulurken girilen receiver adresi
- **Mevcut Sahip:** Çeki elinde bulunduran adres
- **Yeni Alıcı:** Devir sırasında belirlenen adres
- **Aracı Kurum:** Ödeme kapatmaya yetkili adres (deploy sırasında belirlenir)

---

## 9. Aracı Kurum Yetkisi

```solidity
address public intermediary;

modifier onlyIntermediary() {
    require(msg.sender == intermediary, "Only intermediary can perform this action");
    _;
}
```

Constructor'da belirlenebilir:

```solidity
constructor(address _intermediary) {
    require(_intermediary != address(0), "Invalid intermediary address");
    intermediary = _intermediary;
}
```

---

## 10. Fonksiyonlar

### 10.1 Çek Oluşturma

```solidity
function createCheque(
    address firstReceiver,
    uint256 amount,
    uint256 dueDate,
    string memory identityHash,
    string memory maskedReceiverName
) external returns (uint256)
```

Kurallar: `firstReceiver` boş ve creator ile aynı olamaz. `amount > 0`. Çek `PendingApproval` durumunda başlar.

```solidity
event ChequeCreated(uint256 indexed chequeId, address indexed creator, address indexed firstReceiver, uint256 amount);
```

### 10.2 İlk Alıcı Kabul

```solidity
function acceptCheque(uint256 chequeId) external
```

Sadece `firstReceiver` çağırabilir. Çek `PendingApproval` olmalı. Sonuç: `currentOwner = firstReceiver`, status = `Active`.

```solidity
event ChequeAccepted(uint256 indexed chequeId, address indexed receiver);
```

### 10.3 İlk Alıcı Red

```solidity
function rejectCheque(uint256 chequeId) external
```

Sadece `firstReceiver` çağırabilir. Çek `PendingApproval` olmalı. Sonuç: status = `Rejected`.

```solidity
event ChequeRejected(uint256 indexed chequeId, address indexed receiver);
```

### 10.4 Çek Devretme Talebi

```solidity
function requestTransfer(uint256 chequeId, address newReceiver) external
```

Sadece `currentOwner` çağırabilir. Çek `Active` olmalı. `newReceiver` boş ve mevcut sahiple aynı olamaz. Sonuç: `TransferPending`, `pendingReceiver = newReceiver`.

```solidity
event TransferRequested(uint256 indexed chequeId, address indexed from, address indexed to);
```

### 10.5 Devir Kabul

```solidity
function acceptTransfer(uint256 chequeId) external
```

Sadece `pendingReceiver` çağırabilir. Çek `TransferPending` olmalı. Eğer `pendingReceiver == creator` ise çek `Cancelled` yapılabilir. Aksi halde `currentOwner = pendingReceiver`, status = `Active`.

```solidity
event TransferAccepted(uint256 indexed chequeId, address indexed newOwner);
event ChequeCancelled(uint256 indexed chequeId, string reason);
```

### 10.6 Devir Red

```solidity
function rejectTransfer(uint256 chequeId) external
```

Sadece `pendingReceiver` çağırabilir. `pendingReceiver` sıfırlanır, çek eski sahipte kalır, status = `Active`.

```solidity
event TransferRejected(uint256 indexed chequeId, address indexed rejectedBy);
```

### 10.7 Ödeme Talebi

```solidity
function requestPayment(uint256 chequeId) external
```

Sadece `currentOwner` çağırabilir. Çek `Active` olmalı. Sonuç: `PaymentRequested`.

```solidity
event PaymentRequested(uint256 indexed chequeId, address indexed requestedBy);
```

### 10.8 Aracı Kurum Ödeme Kapatma

```solidity
function markAsPaid(uint256 chequeId) external
```

Sadece aracı kurum çağırabilir. Çek `PaymentRequested` olmalı. Sonuç: `Paid`.

```solidity
event ChequePaid(uint256 indexed chequeId, address indexed intermediary);
```

### 10.9 Okuma Fonksiyonları

```solidity
function getCheque(uint256 chequeId) external view returns (Cheque memory)
function getUserCheques(address user) external view returns (uint256[] memory)
```

---

## 11. Geçmiş Takibi

Sprint 1'de **hem event üret hem de basit history array tut**. Sebep: demo ekranında geçmişi göstermek kolaylaşır, makale/sunum için izlenebilirlik daha net.

```solidity
struct HistoryItem {
    uint256 timestamp;
    address actor;
    string action;
}

mapping(uint256 => HistoryItem[]) private chequeHistories;

function getChequeHistory(uint256 chequeId) external view returns (HistoryItem[] memory)
```

Action değerleri: `CREATED`, `ACCEPTED`, `REJECTED`, `TRANSFER_REQUESTED`, `TRANSFER_ACCEPTED`, `TRANSFER_REJECTED`, `PAYMENT_REQUESTED`, `PAID`, `CANCELLED`.

---

## 12. Güvenlik Kontrolleri

Her fonksiyonda uygun `require` kontrolleri bulunmalıdır:

```solidity
require(chequeId > 0 && chequeId <= chequeCounter, "Cheque does not exist");
require(msg.sender == cheque.firstReceiver, "Only first receiver can accept");
require(cheque.status == ChequeStatus.PendingApproval, "Invalid cheque status");
require(newReceiver != address(0), "Invalid receiver address");
require(amount > 0, "Amount must be greater than zero");
```

Final durumlar (`Paid`, `Cancelled`, `Rejected`) olan çeklerde yeni işlem yapılamaz.

---

## 13. Hardhat Test Hesapları

Demo sırasında Hardhat local network hesapları farklı roller için kullanılabilir:

```txt
Account 0 = Aracı Kurum
Account 1 = Çeki Oluşturan
Account 2 = İlk Alıcı
Account 3 = Yeni Alıcı
Account 4 = İkinci Yeni Alıcı
```

---

## 14. Deploy ve Frontend Config

Deploy script'te aracı kurum adresi constructor'a verilir:

```javascript
const [intermediary] = await ethers.getSigners();
const DigitalCheque = await ethers.getContractFactory("DigitalCheque");
const digitalCheque = await DigitalCheque.deploy(intermediary.address);
```

Frontend config dosyaları: `frontend/src/config/contract.js` ve `frontend/src/abi/DigitalCheque.json`. Deploy sonrası bu dosyalar güncellenmelidir.

---

## 15. ERC Standartları Hakkında

Sprint 1'de ERC standardı uygulanmayacaktır. Akademik bağlamda gelecek çalışma olarak tartışılabilir. Sprint 3 aktif olursa öneri sırası: ERC-721 > ERC-1155 > ERC-3643 (teorik). Detaylar `docs/sprint-plan.md` dosyasında.