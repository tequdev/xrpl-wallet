import path from 'path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path.resolve('src', 'index.ts'),
      name: 'XrplWalletReact',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
        },
        intro: (param) => {
          if (param.fileName.endsWith('es.js')) {
            return 'import "./index.css";'
          }
          return ''
        },
      },
    },
  },
  plugins: [react()],
})
