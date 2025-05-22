import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    assetsDir: '',
    copyPublicDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: '/',
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache'
    }
  },
  plugins: [
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use('/sw.js', (req, res, next) => {
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Content-Type', 'application/javascript');
          next();
        });
        
        server.middlewares.use('/manifest.json', (req, res, next) => {
          res.setHeader('Content-Type', 'application/manifest+json');
          next();
        });
      }
    },
    {
      name: 'copy-pwa-files',
      writeBundle() {
        console.log('✅ PWA files should be copied to dist folder');
        console.log('📁 Make sure sw.js and manifest.json are in public/ folder');
      }
    }
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
