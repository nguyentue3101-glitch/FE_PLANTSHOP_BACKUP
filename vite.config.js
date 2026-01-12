import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    tailwindcss(),

  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  // server:{
  //   open:true,
  //   port:3000,
  //   proxy: {
  //     '/api': {
  //       target: 'https://be-plantshop.onrender.com',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     // Proxy cho location API (vnappmob.com) để tránh lỗi CORS
  //   //  '/provinces-api': {
  //   //     target: 'https://provinces.open-api.vn',
  //   //     changeOrigin: true,
  //   //     secure: false,
  //   //     rewrite: (path) => path.replace(/^\/provinces-api/, '/api/v1'),
  //   //     configure: (proxy) => {
  //   //       proxy.on('error', (err) => {
  //   //         console.log('Proxy error:', err)
  //   //       })
  //   //     }
  //   //   }
  //   }
  // }
})
