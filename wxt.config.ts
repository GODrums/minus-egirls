import { defineConfig } from 'wxt';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Minus-Egirls',
    description: 'A browser extension that removes egirls from your Twitter feed.',
    version: '0.0.9',
    host_permissions: ["*://*.twitter.com/*"],
    "permissions": ["storage"],
    web_accessible_resources: [{
      resources: ["inject.js"],
      matches: ["*://*.twitter.com/*"]
    }],
  },
  vite: () => ({
    plugins: [
      svelte({
        // Using a svelte.config.js file causes a segmentation fault when importing the file
        configFile: false,
        preprocess: [vitePreprocess()],
      }),
    ],
  }),
});
