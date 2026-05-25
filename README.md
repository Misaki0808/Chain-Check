# 📝 ChainCheck

ChainCheck, geleneksel çek süreçlerini blockchain teknolojisi üzerine taşıyan, şeffaf ve güvenilir bir **Dijital Çek Simülasyonu** uygulamasıdır. Bu proje, "Blockchain Programming" dersi final projesi olarak geliştirilmiştir.

ChainCheck sayesinde çeklerin oluşturulması, alıcıya teslimi, cirolanması (devredilmesi) ve banka (aracı kurum) tarafından tahsilat/ödeme işlemleri tamamen şeffaf, takip edilebilir ve değiştirilemez bir yapıya kavuşur.

---

## ✨ Özellikler

- **🎭 Rol Bazlı Erişim:** Çeki Oluşturan, İlk Alıcı, Hamil (Mevcut Sahip) ve Aracı Kurum (Banka) rolleri ile gerçek dünya senaryolarının modellenmesi.
- **🛡️ Güvenli Devir (Ciro) İşlemleri:** Çeklerin devir işlemlerinde hem gönderenin talebi hem de alıcının onayı zorunludur. Yanlış transferlerin önüne geçilir.
- **📊 Çeki Oluşturan Özeti:** Çeki oluşturan cüzdanın blockchain üzerindeki geçmiş ödeme/red performansını gösteren şeffaf özet paneli.
- **🕰️ Kronolojik İşlem Geçmişi:** Çekin yaratıldığı andan ödendiği ana kadar geçirdiği tüm durumların blockchain üzerinde zaman damgası (timestamp) ile tutulması.
- **🔗 Akıllı Kontrat Güvencesi:** Tüm kurallar ve durum geçişleri (Oluşturuldu $\rightarrow$ Aktif $\rightarrow$ Devir Bekliyor $\rightarrow$ Ödemeye Gönderildi $\rightarrow$ Ödendi) tek bir güven kaynağı (Single Source of Truth) olan akıllı kontrat tarafından yönetilir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Blockchain & Smart Contract
- **Solidity (^0.8.24):** Akıllı kontrat dili.
- **Hardhat:** Ethereum geliştirme, test ve local network ortamı.
- **Ethers.js (v6):** Frontend ile blockchain arasındaki etkileşim kütüphanesi.

### Frontend
- **React 18:** Modern kullanıcı arayüzü kütüphanesi.
- **Vite:** Hızlı ve modern frontend derleyici.
- **Vanilla CSS:** Bağımlılıklardan uzak, esnek ve özelleştirilmiş tasarım sistemi (Custom Design System).

---

## 🚀 Başlangıç Rehberi (Kurulum ve Çalıştırma)

Projeyi bilgisayarınızda lokal olarak çalıştırmak için Node.js yüklü olmalıdır. Ayrıca tarayıcınızda [MetaMask](https://metamask.io/) eklentisinin kurulu olması gereklidir.

### 1. Projeyi İndirin ve Bağımlılıkları Kurun
```bash
# Repo'yu klonlayın
git clone https://github.com/Misaki0808/Chain-Check.git
cd Chain-Check

# Ana dizindeki bağımlılıkları (Hardhat vb.) kurun
npm install

# Frontend bağımlılıklarını kurun
cd frontend
npm install
cd ..
```

### 2. Local Blockchain Ağını Başlatın (Terminal 1)
Projenin ana dizininde aşağıdaki komutu çalıştırarak test ağını başlatın. (Bu terminal sürekli açık kalmalıdır.)
```bash
npx hardhat node
```
*Not: Bu komut size MetaMask'a ekleyebileceğiniz 20 adet test hesabı (Account) ve Private Key verecektir.*

### 3. Akıllı Kontratı Deploy Edin (Terminal 2)
Yeni bir terminal açın ve projenin ana dizininde kontratı local ağa yükleyin:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Bu komut başarılı olduğunda `frontend/src/config/deployment.json` dosyası otomatik olarak güncellenir.*

### 4. Frontend Uygulamasını Başlatın (Terminal 3)
Yine yeni bir terminal açarak frontend klasörüne gidin ve uygulamayı çalıştırın:
```bash
cd frontend
npm run dev
```
Tarayıcınızda `http://localhost:5173` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

---

## 🧪 Demo Test Akışı ve MetaMask Ayarları

Test aşamasında MetaMask'ınıza "Hardhat Local" ağını eklemeniz ve terminaldeki test hesaplarını kullanmanız gerekmektedir. 

Adım adım detaylı test akışı, cüzdan bağlama ve sorun giderme rehberi için özel hazırladığımız **Manual Test Guide** dosyasını inceleyin:

👉 **[ChainCheck Manual Test Guide & Checklist](./docs/manual-test-guide.md)**

---

## ⚠️ Önemli Uyarı

Bu proje **sadece eğitim ve test amaçlıdır.**
- **Kesinlikle** gerçek para, gerçek banka bilgisi veya gerçek TC/VKN verisi kullanılmaz.
- MetaMask üzerinden işlem yaparken **kesinlikle** şahsi ana hesaplarınızı, gerçek "Seed Phrase" veya "Private Key" bilgilerinizi girmeyin; sadece Hardhat'in ürettiği test Private Key'lerini kullanın. 

---

*ChainCheck - Blockchain tabanlı dijital güven.*
