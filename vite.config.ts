import { defineConfig } from 'vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

import react from '@vitejs/plugin-react-swc';

dotenv.config({ path: resolve('/vault/secrets/.env') });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
