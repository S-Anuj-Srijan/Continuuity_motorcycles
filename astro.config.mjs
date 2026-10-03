import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
const publicEnv = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), 'PUBLIC_');
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || publicEnv.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
  vite: { server: { proxy: { '/api': 'http://localhost:8787' } } }
});
