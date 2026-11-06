// @ts-check
import { defineConfig } from 'astro/config';

// Static site. Stripe checkout lives in netlify/functions, so no adapter is needed.
export default defineConfig({
  site: 'https://vf-customs.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
