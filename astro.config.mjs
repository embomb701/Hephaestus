// @ts-check
import { defineConfig } from 'astro/config';

// Static site. Stripe checkout lives in netlify/functions, so no adapter is needed.
export default defineConfig({
  // TODO: replace with the real domain once it's registered.
  site: 'https://vulcan.example',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
