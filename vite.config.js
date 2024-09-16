import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',  // Polyfill global with globalThis
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
//   server: {
//     historyApiFallback: true, // Handle client-side routing
//   },
  // Add any other configurations you need here
});
