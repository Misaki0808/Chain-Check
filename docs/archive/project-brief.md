> **Archived after documentation merge**

# Project Brief — ChainCheck Dijital Çek Projesi

## 1. Proje Özeti

ChainCheck, geleneksel kağıt tabanlı çek süreçlerini dijital ortamda modelleyen blockchain tabanlı bir demo uygulamasıdır.

Projenin temel amacı; çek oluşturma, alıcı onayı, çek devri, ödeme talebi ve ödeme kapatma süreçlerini blockchain üzerinde izlenebilir, değiştirilemez ve hızlı şekilde gösterebilen çalışan bir prototip geliştirmektir.

Bu proje bir üretim sistemi değildir. Gerçek banka entegrasyonu, gerçek para transferi ve gerçek kimlik doğrulama içermez. Amaç, önerilen sistemin akademik ve teknik olarak gösterilebilir bir demo versiyonunu oluşturmaktır.

---

## 2. Projenin Temel Problemi

Geleneksel çek süreçlerinde kağıt belgeye bağımlılık, fiziksel teslim, manuel kontrol, imza doğrulama, sıra bekleme ve banka şubesi işlemleri zaman kaybına neden olabilir.

Ayrıca çekin el değiştirme sürecinde takip zorluğu, sahtecilik riski, belge kaybı ve işlem geçmişinin merkezi sistemlere bağımlı olması gibi problemler ortaya çıkabilir.

ChainCheck bu problemlere karşı blockchain tabanlı bir dijital çek akışı önermektedir.

---

## 3. Projenin Amacı

Bu projenin amacı:

- Dijital çek oluşturma sürecini göstermek
- Alıcının çeki kabul veya reddetmesini sağlamak
- Çekin mevcut sahibinin çeki başka bir kişiye devredebilmesini göstermek
- Devir zincirini kayıt altına almak
- Aracı kurumun ödeme sürecini kapatabilmesini sağlamak
- Çekin durum geçmişini izlenebilir hale getirmek
- İşlem sürelerini demo ortamında ölçülebilir hale getirmek

---

## 4. Demo Kapsamı

İlk demo yalnızca local ortamda çalışacaktır.

Kullanılacak temel yapı:

- React + Vite frontend
- MetaMask cüzdan bağlantısı
- Solidity smart contract
- Hardhat local blockchain
- ethers.js v6
- Custom smart contract mimarisi
- React Router opsiyonel (birden fazla sayfa gerekirse)

Sprint 1 kapsamında backend, database, gerçek banka entegrasyonu veya gerçek para transferi olmayacaktır.

---

## 5. Kullanıcı Rolleri

Uygulamada teknik ve hukuki terimleri sadeleştirmek için kullanıcıya basit Türkçe kavramlar gösterilecektir.

### Çeki Oluşturan

Çeki sisteme ilk giren kişidir. Tutar, vade ve alıcı bilgilerini girer. İşlemi MetaMask ile imzalar.

### İlk Alıcı

Kendisine çek gönderilen kişidir. Çeki kabul edebilir veya reddedebilir.

### Mevcut Sahip

Çeki o anda elinde bulunduran kişidir. Çeki başka bir kişiye devredebilir veya ödeme sürecini başlatabilir.

### Yeni Alıcı

Çek devredildiğinde çeki kabul etmesi beklenen kişidir.

### Aracı Kurum

Demo sistemde bankayı veya yetkili finansal aracı kurumu temsil eder. Gerçek ödeme yapmaz. Yalnızca çekin ödeme sürecini blockchain üzerinde “Ödendi” statüsüne çeker.

---

## 6. Temel İş Akışı

1. Çeki oluşturan kişi uygulamaya girer.
2. Tutar, vade ve alıcı bilgilerini girer.
3. TC/VKN bilgisi açık şekilde saklanmaz; hashlenmiş veri olarak temsil edilir.
4. Kullanıcı işlemi MetaMask ile imzalar.
5. Çek “Onay Bekliyor” durumunda blockchain’e kaydedilir.
6. İlk alıcı çeki kabul eder veya reddeder.
7. Kabul edilirse çek “Aktif” hale gelir.
8. Mevcut sahip çeki başka bir kişiye devredebilir.
9. Yeni alıcı devri kabul ederse sahiplik değişir.
10. Mevcut sahip ödeme talebi başlatabilir.
11. Aracı kurum ödeme sürecini kapatır.
12. Çek “Ödendi” durumuna geçer.
13. Eğer çek tekrar ilk oluşturan kişiye dönerse sistem uyarı verir ve çek “İptal Edildi” durumuna alınabilir.

---

## 7. Veri Gizliliği Yaklaşımı

Gerçek TC/VKN bilgisi blockchain’e açık şekilde yazılmayacaktır.

Demo kapsamında:

- İsimler maskeli gösterilebilir.
- Örnek: “Ahmet Y.”
- TC/VKN hashlenmiş veri olarak temsil edilir.
- Gerçek kişisel veri kullanılmaz.
- Demo verileri sahte/test verileridir.

Blockchain üzerindeki veriler kalıcı kabul edildiği için hassas kişisel veriler açık şekilde saklanmayacaktır.

---

## 8. Para Transferi Yaklaşımı

Demo uygulamasında gerçek para transferi yapılmayacaktır.

Ödeme süreci yalnızca durum değişimi olarak modellenir.

Örnek:

- “Ödemeye Gönderildi”
- “Ödendi”
- “İptal Edildi”

Bu durumlar blockchain üzerinde smart contract tarafından güncellenir.

---

## 9. İlk MVP Kapsamı

Sprint 1 kapsamında yapılacaklar:

- Cüzdan bağlama
- Çek oluşturma
- Çek listeleme
- Çek detay görüntüleme
- Kabul / red işlemi
- Çek devretme
- Yeni alıcı kabul / red işlemi
- Ödeme talebi başlatma
- Aracı kurum tarafından ödeme kapatma
- Durum geçmişi gösterme
- İşlem hash bilgisini gösterme
- İşlem süresini ölçme

---

## 10. Sprint 1 Dışında Bırakılanlar

Sprint 1 kapsamında yapılmayacaklar:

- Backend geliştirme
- Database entegrasyonu
- Gerçek banka entegrasyonu
- Gerçek para transferi
- Gerçek TC/VKN kaydı
- ERC-721 entegrasyonu
- ERC-1155 entegrasyonu
- Production deployment
- Kullanıcı kayıt sistemi
- Gerçek bildirim sistemi

---

## 11. Gelecek Geliştirme Olasılıkları

Sprint 2 kapsamında gerekirse backend ve database eklenebilir.

Sprint 3 kapsamında gerekirse çeklerin token standardı ile temsil edilmesi değerlendirilebilir.

Muhtemel geliştirme seçenekleri:

- Backend API
- PostgreSQL database
- İşlem geçmişi loglama
- Admin / aracı kurum paneli
- ERC-721 tabanlı çek modeli
- ERC-1155 tabanlı çoklu varlık modeli
- Testnet deployment
- Frontend deployment

---

## 12. Akademik Konumlandırma

Bu proje, blockchain teknolojisinin çek süreçlerinde izlenebilirlik, işlem bütünlüğü ve süreç hızlandırma potansiyelini göstermek amacıyla geliştirilen bir demo prototiptir.

Proje, gerçek finansal sistemlerin yerini aldığını iddia etmez. Bunun yerine, geleneksel çek süreçlerinin dijitalleştirilmesi halinde hangi adımların daha hızlı ve izlenebilir hale gelebileceğini gösterir.

ERC-721, ERC-1155 ve ERC-3643 gibi token standartları akademik bağlamda tartışılabilir. Ancak ilk demo sürümünde süreç yönetimi özel bir Solidity smart contract üzerinden modellenecektir.