import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        signup: './signup.html',
        success: './success.html',
        dashboard: './dashboard.html',
        analytics: './analytics.html',
        logs: './logs.html',
        settings: './settings.html'
      }
    }
  },
  server: {
    open: '/index.html'
  }
})