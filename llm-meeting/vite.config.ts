import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Firebase Hosting optimized configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://backend:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            utils: ['react-markdown', 'mermaid', 'clipboard'],
          },
        },
      },
    },
    define: {
      __BACKEND_URL__: JSON.stringify(
        env.VITE_BACKEND_URL || 
        (mode === 'production' 
          ? 'https://meeting-llm-recording-1013324790992.asia-northeast1.run.app' 
          : 'http://localhost:8080'
        )
      ),
    },
    base: '/',
  }
})
