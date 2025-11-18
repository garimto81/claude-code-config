// Vite Configuration for Photo Factory
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',  // src를 root로 설정하여 public과 js 모두 포함
  publicDir: false,
  envDir: '../',     // .env 파일 위치 (프로젝트 루트)

  resolve: {
    alias: {
      '@js': resolve(__dirname, 'src/js'),
    }
  },

  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능
    port: 3000,
    open: '/public/index.html',  // root 기준 경로
    // CORS 설정
    cors: true,
  },

  build: {
    outDir: '../dist',  // root 기준으로 상대 경로
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: 'public/index.html',
        upload: 'public/upload.html',
        gallery: 'public/gallery.html',
        'job-detail': 'public/job-detail.html',
      }
    }
  },

  // Environment variables
  envPrefix: 'VITE_',
});
