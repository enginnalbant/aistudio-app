import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function fixBlockSuiteIconTypo() {
  return {
    name: 'fix-blocksuite-icon-typo',
    transform(code: string, id: string) {
      if (id.includes('@blocksuite') && code.includes('CheckBoxCkeckSolidIcon')) {
        return {
          code: code.replace(/import\s*{\s*CheckBoxCkeckSolidIcon/g, 'import { CheckBoxCheckSolidIcon as CheckBoxCkeckSolidIcon'),
          map: null
        };
      }
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [fixBlockSuiteIconTypo(), react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      hmr: false,
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
    },
  };
});
