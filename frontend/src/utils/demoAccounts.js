/**
 * ChainCheck — Otomatik Demo Hesapları (YALNIZCA LOCAL DEMO)
 *
 * Bu private key'ler Hardhat'in herkesçe bilinen, varsayılan test
 * cüzdanlarına aittir ("test test ... junk" mnemonic). Gerçek para veya
 * gerçek bir kullanıcıya ait DEĞİLDİR — yalnızca local Hardhat ağında,
 * MetaMask popup'ı olmadan otomatik demo oynatmak için kullanılır.
 *
 * ⚠️ Production'da veya gerçek bir ağda ASLA kullanılmamalıdır.
 */

// Hardhat node JSON-RPC adresi.
// Tarayıcıda same-origin /rpc (Vite proxy → node) kullanılır; böylece
// Hardhat node'un CORS kısıtı (POST'a izin vermemesi) aşılır. Tarayıcı dışı
// (Node script) içe aktarımlarda doğrudan node adresi kullanılır.
export const RPC_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/rpc`
    : 'http://127.0.0.1:8545';

// Rol indeksleri — deploy.js'teki sıralama ile birebir aynı
export const DEMO_WALLETS = [
  {
    index: 0,
    role: "Aracı Kurum",
    label: "Account 0",
    color: "#7c3aed",
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    index: 1,
    role: "Keşideci",
    label: "Account 1",
    color: "#2563eb",
    privateKey:
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    index: 2,
    role: "İlk Alıcı",
    label: "Account 2",
    color: "#059669",
    privateKey:
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    index: 3,
    role: "Yeni Alıcı",
    label: "Account 3",
    color: "#d97706",
    privateKey:
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
];
