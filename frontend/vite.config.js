import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Otomatik Tanıtım modu tarayıcıdan doğrudan Hardhat node'a bağlanır.
    // Hardhat node CORS preflight'ta POST'a izin vermediği için JSON-RPC
    // isteklerini same-origin /rpc üzerinden node'a proxy'liyoruz.
    proxy: {
      '/rpc': {
        target: 'http://127.0.0.1:8545',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
      },
    },
  },
})
