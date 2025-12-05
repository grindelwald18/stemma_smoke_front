import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // слушать все входящие подключения
    port: 5174, // можно также сменить порт, если нужно
  },
})
