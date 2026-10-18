import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Caminhos relativos: o build funciona na raiz do domínio ou em subpasta.
  base: './',
  plugins: [react(), tailwindcss()],
});
